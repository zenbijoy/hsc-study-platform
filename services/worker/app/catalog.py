from __future__ import annotations

import json
import threading
import uuid
from pathlib import Path
from typing import Any
from app.config import settings


class LocalCatalog:
    def __init__(self, path: Path):
        self.path = path
        self.lock = threading.Lock()
        if not path.exists():
            path.write_text(json.dumps({"books": [], "packs": [], "imports": [], "formulas": []}, indent=2), encoding="utf-8")

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

    def upsert_book(self, book: dict[str, Any]) -> None:
        with self.lock:
            data = self._read()
            books = data.setdefault("books", [])
            existing = next((x for x in books if x.get("id") == book.get("id")), None)
            if existing: existing.update(book)
            else: books.append(book)
            self._write(data)

    def upsert_pack(self, manifest: dict[str, Any], storage: dict[str, Any], import_id: str) -> str:
        pack_id = str(uuid.uuid4())
        with self.lock:
            data = self._read()
            data.setdefault("packs", []).append({"id": pack_id, "import_id": import_id, **manifest, "storage": storage, "is_published": False})
            self._write(data)
        return pack_id

    def stage_formulas(self, rows: list[dict[str, Any]], import_id: str) -> int:
        with self.lock:
            data = self._read()
            formulas = data.setdefault("formulas", [])
            existing = {x.get("fingerprint") for x in formulas}
            added = 0
            for row in rows:
                if row.get("fingerprint") in existing:
                    continue
                formulas.append({**row, "import_id": import_id, "is_published": False})
                existing.add(row.get("fingerprint")); added += 1
            self._write(data)
            return added

    def publish_import(self, book_id: str | None, book_version_id: str | None, pack_ids: list[str], import_id: str) -> None:
        with self.lock:
            data = self._read()
            if book_id:
                for book in data.get("books", []):
                    if book.get("id") == book_id:
                        book["is_published"] = True
                        book["published_version_id"] = book_version_id
            for pack in data.get("packs", []):
                if pack.get("id") in pack_ids:
                    pack["is_published"] = True
            for formula in data.get("formulas", []):
                if formula.get("import_id") == import_id:
                    formula["is_published"] = True
            self._write(data)


class SupabaseCatalog:
    """Server-side publisher. Service-role key is required and must never be exposed to clients."""

    def __init__(self):
        from supabase import create_client
        self.client = create_client(settings.supabase_url, settings.supabase_service_role_key)

    def upsert_book(self, book: dict[str, Any]) -> None:
        book_id = book["id"]
        version_id = book["book_version_id"]
        self.client.table("books").upsert({
            "id": book_id,
            "title": book["title"],
            "subtitle": book.get("subtitle"),
            "publisher": book.get("publisher"),
            "is_protected": bool(book.get("is_protected", True)),
            "is_published": False,
            "chapter_count": int(book.get("chapter_count", 0)),
            "formula_count": int(book.get("formula_count", 0)),
            "source_hash": book.get("source_hash"),
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
        }).execute()

        wrapped = book.get("server_wrapped_content_key") or {}
        if wrapped.get("key_version") and wrapped.get("nonce_b64") and wrapped.get("ciphertext_b64"):
            self.client.table("book_secrets").upsert({
                "book_version_id": version_id,
                "key_version": wrapped["key_version"],
                "nonce_b64": wrapped["nonce_b64"],
                "ciphertext_b64": wrapped["ciphertext_b64"],
            }).execute()

        chapters = book.get("chapters") or []
        if chapters:
            rows = [{
                "book_id": book_id,
                "book_version_id": version_id,
                "chapter_number": int(ch["number"]),
                "title": ch["title"],
                "start_page": int(ch["start_page"]),
                "end_page": ch.get("end_page"),
                "confidence": ch.get("confidence", 1.0),
                "detection_source": ch.get("source"),
                "sort_order": int(ch["number"]),
            } for ch in chapters]
            self.client.table("book_chapters").upsert(rows, on_conflict="book_version_id,chapter_number").execute()

    def upsert_pack(self, manifest: dict[str, Any], storage: dict[str, Any], import_id: str) -> str:
        key_parts = str(manifest.get("key", "unknown/unclassified/mixed")).split("/")
        subject = key_parts[0] if key_parts else None
        pack_type = key_parts[-1] if key_parts else "mixed"
        allowed = {"formula", "cq", "mcq", "note", "definition", "flashcard", "search", "mixed"}
        if pack_type not in allowed: pack_type = "mixed"
        pack_id = str(uuid.uuid4())
        row = {
            "id": pack_id,
            "subject_id": subject if subject and subject != "unknown" else None,
            "pack_type": pack_type,
            "version": 1,
            "storage_provider": storage.get("provider") or settings.storage_provider,
            "object_id": storage.get("object_id"),
            "delivery_url": storage.get("delivery_url"),
            "item_count": int(manifest.get("count", 0)),
            "byte_size": int(manifest.get("byte_size", 0)),
            "sha256": manifest.get("sha256"),
            "codec": manifest.get("codec"),
            "encrypted": False,
            "is_published": False,
        }
        try:
            self.client.table("content_packs").insert(row).execute()
        except Exception:
            # Subject may not yet exist in canonical syllabus. Retry with no subject link rather than lose the pack.
            row["subject_id"] = None
            self.client.table("content_packs").insert(row).execute()
        return pack_id

    def stage_formulas(self, rows: list[dict[str, Any]], import_id: str) -> int:
        if not rows:
            return 0
        allowed_subjects = {x["id"] for x in (self.client.table("subjects").select("id").execute().data or [])}
        payloads = []
        for row in rows:
            fp = row.get("fingerprint")
            if not fp:
                continue
            formula_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"hsc:formula:{fp}"))
            payloads.append({
                "id": formula_id,
                "subject_id": row.get("subject") if row.get("subject") in allowed_subjects else None,
                "chapter_label": row.get("chapter"),
                "title": row.get("title") or "Formula",
                "latex": row.get("latex") or row.get("plain_text") or "",
                "plain_text": row.get("plain_text") or row.get("latex") or "",
                "importance": int(row.get("importance") or 3),
                "usage_count": int(row.get("usage_count") or 0),
                "import_id": import_id,
                "fingerprint": fp,
                "is_published": False,
            })
        for i in range(0, len(payloads), 500):
            self.client.table("formula_catalog").upsert(payloads[i:i+500], on_conflict="fingerprint").execute()
        return len(payloads)

    def publish_import(self, book_id: str | None, book_version_id: str | None, pack_ids: list[str], import_id: str) -> None:
        if book_id and book_version_id:
            self.client.table("books").update({"is_published": True, "published_version_id": book_version_id}).eq("id", book_id).execute()
        if pack_ids:
            self.client.table("content_packs").update({"is_published": True}).in_("id", pack_ids).execute()
        self.client.table("formula_catalog").update({"is_published": True}).eq("import_id", import_id).execute()

    def append(self, collection: str, item: dict[str, Any]) -> None:
        table = "import_audit" if collection == "imports" else "content_pack_audit"
        payload = item if table == "content_pack_audit" else {
            "import_id": item.get("id"),
            "source_name": item.get("source_name"),
            "source_hash": item.get("source_hash"),
            "status": item.get("status"),
            "payload": item,
        }
        try: self.client.table(table).insert(payload).execute()
        except Exception: pass


def get_catalog():
    if settings.supabase_url and settings.supabase_service_role_key:
        return SupabaseCatalog()
    return LocalCatalog(settings.catalog_file)
