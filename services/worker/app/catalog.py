from __future__ import annotations

import difflib
import json
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.canonical_syllabus import validate_chapter_boundaries
from app.config import settings
from app.models import (
    Book,
    BookAuditEntry,
    BookChapterRevision,
    BookRelationship,
    BookValidationResult,
    BookVersion,
    ChapterCandidate,
    ContentIssue,
    QualitySummary,
    VersionDiffResult,
)


class LocalCatalog:
    def __init__(self, path: Path):
        self.path = path
        self.lock = threading.Lock()
        if not path.exists():
            path.write_text(
                json.dumps(
                    {
                        "books": [],
                        "book_versions": [],
                        "chapter_revisions": [],
                        "packs": [],
                        "imports": [],
                        "formulas": [],
                        "import_groups": [],
                        "issues": [],
                        "audit_log": [],
                        "relationships": [],
                    },
                    indent=2,
                ),
                encoding="utf-8",
            )

    def _read(self) -> dict:
        return json.loads(self.path.read_text("utf-8"))

    def _write(self, data: dict):
        tmp = self.path.with_suffix(".tmp")
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(self.path)

    def append(self, collection: str, item: dict[str, Any]) -> None:
        with self.lock:
            data = self._read()
            data.setdefault(collection, []).append(item)
            self._write(data)

    def list_books(self) -> list[dict[str, Any]]:
        with self.lock:
            return list(self._read().get("books", []))

    def get_book(self, book_id: str) -> dict[str, Any] | None:
        with self.lock:
            return next((b for b in self._read().get("books", []) if b.get("id") == book_id), None)

    def upsert_book(self, book: dict[str, Any]) -> None:
        with self.lock:
            data = self._read()
            books = data.setdefault("books", [])
            existing = next((x for x in books if x.get("id") == book.get("id")), None)
            if existing:
                existing.update(book)
                existing["updated_at"] = datetime.now(timezone.utc).isoformat()
            else:
                book.setdefault("status", "DRAFT")
                book.setdefault("created_at", datetime.now(timezone.utc).isoformat())
                book.setdefault("updated_at", datetime.now(timezone.utc).isoformat())
                books.append(book)

            # Keep book_versions synced if book_version_id present
            version_id = book.get("book_version_id")
            if version_id:
                versions = data.setdefault("book_versions", [])
                v_existing = next((v for v in versions if v.get("id") == version_id), None)
                v_payload = {
                    "id": version_id,
                    "book_id": book.get("id"),
                    "version": int(book.get("version", 1)),
                    "edition_label": book.get("edition"),
                    "page_count": int(book.get("page_count", 0)),
                    "package_sha256": book.get("package_sha256"),
                    "storage_provider": settings.storage_provider,
                    "status": "ACTIVE" if book.get("is_published") else "READY",
                    "is_active": bool(book.get("is_published")),
                    "search_status": "READY" if book.get("search_object") else "UNAVAILABLE",
                    "hscp_status": "READY" if book.get("secure_object") else "PROCESSING",
                    "text_ratio": book.get("text_ratio", 0.0),
                    "is_scanned": book.get("is_scanned", False),
                    "cover_candidates": book.get("cover_candidates", []),
                    "selected_cover_page": book.get("selected_cover_page", 1),
                    "created_at": book.get("created_at", datetime.now(timezone.utc).isoformat()),
                }
                if v_existing:
                    v_existing.update(v_payload)
                else:
                    versions.append(v_payload)

            self._write(data)

    def list_books_paginated(
        self,
        offset: int = 0,
        limit: int = 25,
        search: str | None = None,
        status: str | None = None,
        subject_id: str | None = None,
        paper: int | None = None,
        rights_status: str | None = None,
        reader_ready: bool | None = None,
        search_ready: bool | None = None,
        chapter_map_ready: bool | None = None,
        sort_by: str = "updated_at",
        sort_order: str = "desc",
    ) -> tuple[list[dict[str, Any]], int]:
        with self.lock:
            data = self._read()
            all_books = data.get("books", [])
            versions = data.get("book_versions", [])

        # Enrich books with active version data
        enriched = []
        for b in all_books:
            b_copy = dict(b)
            v_list = [v for v in versions if v.get("book_id") == b.get("id")]
            active_v = next((v for v in v_list if v.get("id") == b.get("published_version_id") or v.get("is_active")), None) or (v_list[0] if v_list else None)
            b_copy["versions"] = v_list
            b_copy["active_version"] = active_v
            b_copy["reader_ready"] = bool(b.get("package_sha256") or (active_v and active_v.get("package_sha256")))
            b_copy["search_ready"] = bool(b.get("search_object") or (active_v and active_v.get("search_status") == "READY"))
            b_copy["chapter_map_ready"] = len(b.get("chapters", [])) > 0
            enriched.append(b_copy)

        # Filters
        filtered = []
        for b in enriched:
            if status and b.get("status") != status and (status != "DRAFT" or b.get("is_published")):
                continue
            if subject_id and b.get("subject_id") != subject_id:
                continue
            if paper is not None and b.get("paper") != paper:
                continue
            if rights_status and b.get("rights_status") != rights_status:
                continue
            if reader_ready is not None and b.get("reader_ready") != reader_ready:
                continue
            if search_ready is not None and b.get("search_ready") != search_ready:
                continue
            if chapter_map_ready is not None and b.get("chapter_map_ready") != chapter_map_ready:
                continue
            if search:
                query = search.lower().strip()
                title = str(b.get("title", "")).lower()
                publisher = str(b.get("publisher", "")).lower()
                subj = str(b.get("subject_id", "")).lower()
                bid = str(b.get("id", "")).lower()
                src_hash = str(b.get("source_hash", "")).lower()
                if not (query in title or query in publisher or query in subj or query in bid or query in src_hash):
                    continue
            filtered.append(b)

        # Sorting
        reverse = sort_order.lower() == "desc"
        filtered.sort(key=lambda x: str(x.get(sort_by) or ""), reverse=reverse)

        total = len(filtered)
        paginated = filtered[offset : offset + limit]
        return paginated, total

    def get_book_full(self, book_id: str) -> dict[str, Any] | None:
        with self.lock:
            data = self._read()
            book = next((b for b in data.get("books", []) if b.get("id") == book_id), None)
            if not book:
                return None
            book_copy = dict(book)
            book_versions = [v for v in data.get("book_versions", []) if v.get("book_id") == book_id]
            revisions = [r for r in data.get("chapter_revisions", []) if r.get("book_id") == book_id]
            issues = [i for i in data.get("issues", []) if i.get("book_id") == book_id]
            audit = [a for a in data.get("audit_log", []) if a.get("book_id") == book_id]
            rels = [rel for rel in data.get("relationships", []) if rel.get("book_id") == book_id]

        active_v = next((v for v in book_versions if v.get("id") == book.get("published_version_id") or v.get("is_active")), None) or (book_versions[0] if book_versions else None)

        # Calculate health indicators
        blocking, warnings = self.validate_book_publication(book_id, active_v.get("id") if active_v else None)
        health = {
            "metadata": "Ready" if book.get("title") and book.get("subject_id") else "Incomplete",
            "cover": "Ready" if book.get("cover_url") else "Missing",
            "chapters": f"{len(book.get('chapters', []))} mapped" if book.get("chapters") else "Unmapped",
            "reader": "Ready" if (book.get("package_sha256") or (active_v and active_v.get("package_sha256"))) else "Missing",
            "search": "Ready" if (book.get("search_object") or (active_v and active_v.get("search_status") == "READY")) else "Unavailable",
            "hscp": "Verified" if book.get("package_sha256") else "Unverified",
            "rights": "Authorized" if (book.get("rights_status") != "UNVERIFIED" and book.get("distribution_allowed")) else "Restricted",
            "mobile": "Published" if book.get("is_published") else "Draft",
        }

        book_copy["versions"] = book_versions
        book_copy["active_version"] = active_v
        book_copy["chapter_revisions"] = revisions
        book_copy["issues"] = issues
        book_copy["audit_log"] = audit
        book_copy["relationships"] = rels
        book_copy["blocking_issues"] = blocking
        book_copy["warnings"] = warnings
        book_copy["health"] = health
        return book_copy

    def update_book_metadata(self, book_id: str, updates: dict[str, Any], actor: str = "admin@hscstudy.internal", reason: str | None = None) -> dict[str, Any]:
        with self.lock:
            data = self._read()
            books = data.setdefault("books", [])
            book = next((b for b in books if b.get("id") == book_id), None)
            if not book:
                raise ValueError(f"Book {book_id} not found")

            # Optimistic Locking Check
            client_token = updates.get("version_token")
            if client_token is not None and client_token != book.get("version_token", 1):
                raise ValueError("Record changed by another admin. Please reload.")

            before_state = {k: book.get(k) for k in updates.keys() if k != "version_token"}

            # Mark Admin Override
            updates["metadata_locked_by_admin"] = True
            prov = book.setdefault("classification_provenance", {})
            for k in updates.keys():
                if k in ("title", "subtitle", "subject_id", "paper", "publisher", "edition", "tags", "description", "academic_year"):
                    prov[k] = "ADMIN_OVERRIDE"

            book.update(updates)
            book["version_token"] = book.get("version_token", 1) + 1
            book["updated_at"] = datetime.now(timezone.utc).isoformat()

            # Record Audit Event
            after_state = {k: book.get(k) for k in updates.keys() if k != "version_token"}
            audit_entry = {
                "id": str(uuid.uuid4()),
                "book_id": book_id,
                "book_version_id": book.get("published_version_id"),
                "action": "METADATA_CHANGED",
                "actor_email": actor,
                "before_state": before_state,
                "after_state": after_state,
                "reason": reason or "Admin metadata update",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            data.setdefault("audit_log", []).append(audit_entry)
            self._write(data)
            return book

    def save_chapter_revision(
        self,
        book_id: str,
        version_id: str,
        chapters: list[dict[str, Any]],
        source: str = "ADMIN_MANUAL",
        actor: str = "admin@hscstudy.internal",
    ) -> dict[str, Any]:
        with self.lock:
            data = self._read()
            books = data.setdefault("books", [])
            book = next((b for b in books if b.get("id") == book_id), None)
            if not book:
                raise ValueError(f"Book {book_id} not found")

            revisions = data.setdefault("chapter_revisions", [])
            existing_revs = [r for r in revisions if r.get("book_version_id") == version_id]
            next_rev_num = max([r.get("revision_number", 0) for r in existing_revs], default=0) + 1

            # Mark previous active revisions as SUPERSEDED
            for r in existing_revs:
                if r.get("status") == "ACTIVE":
                    r["status"] = "SUPERSEDED"

            revision = {
                "id": str(uuid.uuid4()),
                "book_id": book_id,
                "book_version_id": version_id,
                "revision_number": next_rev_num,
                "chapters": chapters,
                "source": source,
                "status": "ACTIVE",
                "created_by": actor,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            revisions.append(revision)

            # Update book chapters & lock
            book["chapters"] = chapters
            book["chapter_count"] = len(chapters)
            book["chapters_locked_by_admin"] = True
            book["updated_at"] = datetime.now(timezone.utc).isoformat()

            audit_entry = {
                "id": str(uuid.uuid4()),
                "book_id": book_id,
                "book_version_id": version_id,
                "action": "CHAPTER_MAP_CHANGED",
                "actor_email": actor,
                "before_state": {"revision": next_rev_num - 1},
                "after_state": {"revision": next_rev_num, "chapter_count": len(chapters)},
                "reason": f"Chapter map revision {next_rev_num} saved",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            data.setdefault("audit_log", []).append(audit_entry)
            self._write(data)
            return revision

    def publish_book_version(
        self,
        book_id: str,
        version_id: str,
        rights_confirmed: bool = True,
        rights_status: str = "LICENSED",
        distribution_allowed: bool = True,
        actor: str = "admin@hscstudy.internal",
    ) -> None:
        blocking, _ = self.validate_book_publication(book_id, version_id)
        if rights_status == "UNVERIFIED" or not distribution_allowed:
            raise ValueError("Cannot publish with UNVERIFIED rights or disabled distribution")
        blocking = [b for b in blocking if "rights_status is UNVERIFIED" not in b and "Distribution is not permitted" not in b]
        if blocking:
            raise ValueError(f"Publication blocked: {'; '.join(blocking)}")

        with self.lock:
            data = self._read()
            books = data.setdefault("books", [])
            book = next((b for b in books if b.get("id") == book_id), None)
            if not book:
                raise ValueError(f"Book {book_id} not found")

            now_iso = datetime.now(timezone.utc).isoformat()
            prev_version = book.get("published_version_id")

            # Update versions
            for v in data.setdefault("book_versions", []):
                if v.get("book_id") == book_id:
                    if v.get("id") == version_id:
                        v["is_active"] = True
                        v["status"] = "ACTIVE"
                    else:
                        v["is_active"] = False
                        v["status"] = "INACTIVE"

            # Update book pointer
            book["is_published"] = True
            book["status"] = "ACTIVE"
            book["published_version_id"] = version_id
            book["rights_status"] = rights_status
            book["distribution_allowed"] = distribution_allowed
            book["offline_download_allowed"] = distribution_allowed
            if not book.get("first_published_at"):
                book["first_published_at"] = now_iso
            book["current_version_published_at"] = now_iso
            book["updated_at"] = now_iso

            audit_entry = {
                "id": str(uuid.uuid4()),
                "book_id": book_id,
                "book_version_id": version_id,
                "action": "VERSION_PUBLISHED",
                "actor_email": actor,
                "before_state": {"published_version_id": prev_version},
                "after_state": {"published_version_id": version_id, "rights_status": rights_status},
                "reason": "Admin published book version to mobile catalog",
                "created_at": now_iso,
            }
            data.setdefault("audit_log", []).append(audit_entry)
            self._write(data)

    def rollback_book_version(self, book_id: str, target_version_id: str, reason: str | None = None, actor: str = "admin@hscstudy.internal") -> None:
        with self.lock:
            data = self._read()
            books = data.setdefault("books", [])
            book = next((b for b in books if b.get("id") == book_id), None)
            if not book:
                raise ValueError(f"Book {book_id} not found")

            prev_version = book.get("published_version_id")
            for v in data.setdefault("book_versions", []):
                if v.get("book_id") == book_id:
                    v["is_active"] = v.get("id") == target_version_id
                    v["status"] = "ACTIVE" if v.get("id") == target_version_id else "INACTIVE"

            book["published_version_id"] = target_version_id
            book["updated_at"] = datetime.now(timezone.utc).isoformat()

            audit_entry = {
                "id": str(uuid.uuid4()),
                "book_id": book_id,
                "book_version_id": target_version_id,
                "action": "VERSION_ROLLBACK",
                "actor_email": actor,
                "before_state": {"published_version_id": prev_version},
                "after_state": {"published_version_id": target_version_id},
                "reason": reason or "Admin rolled back book version",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            data.setdefault("audit_log", []).append(audit_entry)
            self._write(data)

    def unpublish_book(self, book_id: str, reason: str | None = None, actor: str = "admin@hscstudy.internal") -> None:
        with self.lock:
            data = self._read()
            books = data.setdefault("books", [])
            book = next((b for b in books if b.get("id") == book_id), None)
            if not book:
                raise ValueError(f"Book {book_id} not found")

            book["is_published"] = False
            book["status"] = "UNPUBLISHED"
            book["updated_at"] = datetime.now(timezone.utc).isoformat()

            audit_entry = {
                "id": str(uuid.uuid4()),
                "book_id": book_id,
                "book_version_id": book.get("published_version_id"),
                "action": "UNPUBLISH",
                "actor_email": actor,
                "before_state": {"is_published": True, "status": "ACTIVE"},
                "after_state": {"is_published": False, "status": "UNPUBLISHED"},
                "reason": reason or "Book unpublished from student catalog",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            data.setdefault("audit_log", []).append(audit_entry)
            self._write(data)

    def archive_book(self, book_id: str, actor: str = "admin@hscstudy.internal") -> None:
        with self.lock:
            data = self._read()
            books = data.setdefault("books", [])
            book = next((b for b in books if b.get("id") == book_id), None)
            if not book:
                raise ValueError(f"Book {book_id} not found")

            book["is_published"] = False
            book["status"] = "ARCHIVED"
            book["updated_at"] = datetime.now(timezone.utc).isoformat()

            audit_entry = {
                "id": str(uuid.uuid4()),
                "book_id": book_id,
                "book_version_id": book.get("published_version_id"),
                "action": "ARCHIVE",
                "actor_email": actor,
                "before_state": {"status": book.get("status")},
                "after_state": {"status": "ARCHIVED"},
                "reason": "Book archived",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            data.setdefault("audit_log", []).append(audit_entry)
            self._write(data)

    def get_quality_summary(self) -> QualitySummary:
        with self.lock:
            data = self._read()
            books = data.get("books", [])
            issues = data.get("issues", [])

        summary = QualitySummary(
            total_books=len(books),
            published_books=len([b for b in books if b.get("is_published")]),
            draft_books=len([b for b in books if not b.get("is_published")]),
            missing_covers=len([b for b in books if not b.get("cover_url")]),
            missing_chapters=len([b for b in books if not b.get("chapters")]),
            broken_packages=len([b for b in books if not b.get("package_sha256")]),
            search_failures=len([b for b in books if b.get("is_scanned") and not b.get("search_object")]),
            rights_unverified=len([b for b in books if b.get("rights_status") == "UNVERIFIED"]),
            open_reports=len([i for i in issues if i.get("status") in ("OPEN", "INVESTIGATING")]),
        )
        return summary

    def list_issues(self, book_id: str | None = None, status: str | None = None) -> list[dict[str, Any]]:
        with self.lock:
            data = self._read()
            issues = data.get("issues", [])
            if book_id:
                issues = [i for i in issues if i.get("book_id") == book_id]
            if status:
                issues = [i for i in issues if i.get("status") == status]
            return issues

    def create_issue(self, issue: dict[str, Any]) -> dict[str, Any]:
        with self.lock:
            data = self._read()
            issue.setdefault("id", str(uuid.uuid4()))
            issue.setdefault("status", "OPEN")
            issue.setdefault("created_at", datetime.now(timezone.utc).isoformat())
            issue.setdefault("updated_at", datetime.now(timezone.utc).isoformat())
            data.setdefault("issues", []).append(issue)
            self._write(data)
            return issue

    def update_issue(self, issue_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        with self.lock:
            data = self._read()
            issues = data.setdefault("issues", [])
            issue = next((i for i in issues if i.get("id") == issue_id), None)
            if not issue:
                raise ValueError(f"Issue {issue_id} not found")
            issue.update(updates)
            issue["updated_at"] = datetime.now(timezone.utc).isoformat()
            self._write(data)
            return issue

    def validate_book_publication(self, book_id: str, book_version_id: str | None = None) -> tuple[list[str], list[str]]:
        blocking_issues: list[str] = []
        warnings: list[str] = []

        book = self.get_book(book_id)
        if not book:
            blocking_issues.append(f"Book with ID {book_id} does not exist")
            return blocking_issues, warnings

        # 1. Rights check
        rights = book.get("rights_status", "UNVERIFIED")
        if rights == "UNVERIFIED":
            blocking_issues.append("Book rights_status is UNVERIFIED — explicit licensing or ownership required")
        if not book.get("distribution_allowed", False):
            blocking_issues.append("Distribution is not permitted for this book")

        # 2. Metadata completeness
        if not book.get("title") or not str(book.get("title")).strip():
            blocking_issues.append("Book title is missing or empty")
        if not book.get("subject_id"):
            blocking_issues.append("Subject is unclassified")

        # 3. Secure Package existence
        if not book.get("package_sha256") and not book.get("secure_object"):
            blocking_issues.append("Encrypted HSCP package is missing or corrupted")

        # 4. Chapter boundaries validation
        raw_chapters = book.get("chapters", [])
        if raw_chapters:
            chapter_candidates = [
                ChapterCandidate(
                    number=c.get("number", i + 1),
                    title=c.get("title", ""),
                    start_page=c.get("start_page", 1),
                    end_page=c.get("end_page"),
                )
                for i, c in enumerate(raw_chapters)
            ]
            page_count = int(book.get("page_count", 1))
            ch_blocking, ch_warnings = validate_chapter_boundaries(chapter_candidates, page_count)
            blocking_issues.extend(ch_blocking)
            warnings.extend(ch_warnings)
        else:
            warnings.append("No chapter outline detected; entire book will open as single section")

        # 5. Scanned / OCR warning
        if book.get("is_scanned") and not book.get("search_pack_id"):
            warnings.append("Scanned PDF has not been OCR indexed; search in reader will be unavailable")

        return blocking_issues, warnings


class SupabaseCatalog:
    """Production Server-side Catalog."""

    def __init__(self):
        from supabase import create_client

        self.client = create_client(settings.supabase_url, settings.supabase_service_role_key)

    def list_books(self) -> list[dict[str, Any]]:
        res = self.client.table("books").select("*, book_versions(*)").execute()
        return res.data or []

    def get_book(self, book_id: str) -> dict[str, Any] | None:
        res = self.client.table("books").select("*, book_versions(*), book_chapters(*)").eq("id", book_id).execute()
        return res.data[0] if res.data else None

    def upsert_book(self, book: dict[str, Any]) -> None:
        book_id = book["id"]
        version_id = book["book_version_id"]
        self.client.table("books").upsert({
            "id": book_id,
            "title": book["title"],
            "subtitle": book.get("subtitle"),
            "publisher": book.get("publisher"),
            "edition": book.get("edition"),
            "subject_id": book.get("subject_id") or "physics",
            "paper": book.get("paper") or 1,
            "status": book.get("status", "DRAFT"),
            "is_protected": bool(book.get("is_protected", True)),
            "is_published": bool(book.get("is_published", False)),
            "chapter_count": int(book.get("chapter_count", 0)),
            "formula_count": int(book.get("formula_count", 0)),
            "source_hash": book.get("source_hash"),
            "cover_url": book.get("cover_url"),
            "cover_thumbnail_url": book.get("cover_thumbnail_url"),
            "rights_status": book.get("rights_status", "UNVERIFIED"),
            "distribution_allowed": bool(book.get("distribution_allowed", False)),
            "offline_download_allowed": bool(book.get("offline_download_allowed", False)),
            "classification_confidence": book.get("confidence_scores", {}),
            "classification_provenance": book.get("provenance", {}),
            "import_group_id": book.get("import_group_id"),
        }).execute()

        original = book.get("original_object") or {}
        secure = book.get("secure_object") or {}
        self.client.table("book_versions").upsert({
            "id": version_id,
            "book_id": book_id,
            "version": int(book.get("version", 1)),
            "page_count": int(book.get("page_count", 0)),
            "package_sha256": book.get("package_sha256"),
            "storage_provider": secure.get("provider") or original.get("provider") or settings.storage_provider,
            "original_object_id": original.get("object_id"),
            "secure_object_id": secure.get("object_id"),
            "delivery_url": secure.get("delivery_url"),
            "original_metadata": original,
            "secure_metadata": secure,
            "is_active": True,
            "text_ratio": book.get("text_ratio", 0.0),
            "is_scanned": book.get("is_scanned", False),
            "cover_candidates": book.get("cover_candidates", []),
            "selected_cover_page": book.get("selected_cover_page", 1),
        }).execute()

    def validate_book_publication(self, book_id: str, book_version_id: str | None = None) -> tuple[list[str], list[str]]:
        blocking_issues: list[str] = []
        warnings: list[str] = []

        book = self.get_book(book_id)
        if not book:
            blocking_issues.append(f"Book with ID {book_id} not found")
            return blocking_issues, warnings

        if book.get("rights_status") == "UNVERIFIED":
            blocking_issues.append("Book rights_status is UNVERIFIED")
        if not book.get("distribution_allowed"):
            blocking_issues.append("Distribution is not allowed")

        return blocking_issues, warnings


def get_catalog():
    if settings.supabase_url and settings.supabase_service_role_key:
        return SupabaseCatalog()
    return LocalCatalog(settings.catalog_file)
