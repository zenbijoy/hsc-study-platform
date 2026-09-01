from __future__ import annotations

import base64
import json
import uuid
from pathlib import Path
from typing import Any

from app.catalog import get_catalog
from app.config import settings
from app.dedupe_engine import evaluate_duplicate
from app.hscp import build_hscp, wrap_content_key_for_server
from app.job_store import JobStore
from app.models import ImportJob
from app.packs import build_content_packs
from app.parsers import iter_content_file
from app.pdf_analyzer import analyze_pdf
from app.search_index import build_search_index
from app.staging import StagingContentStore
from app.storage import get_storage_provider
from app.utils import sha256_file


class ContentPipeline:
    def __init__(self, store: JobStore):
        self.store = store
        self.storage = get_storage_provider()
        self.catalog = get_catalog()

    def update(
        self,
        job: ImportJob,
        *,
        stage: str | None = None,
        progress: float | None = None,
        message: str | None = None,
        **fields,
    ):
        if stage is not None:
            job.stage = stage
            job.checkpoints[stage] = True
        if progress is not None:
            job.progress = progress
        if message is not None:
            job.message = message
        for k, v in fields.items():
            setattr(job, k, v)
        self.store.put(job)

    def process(self, job: ImportJob) -> ImportJob:
        source = Path(job.source_path)
        stage_store: StagingContentStore | None = None
        try:
            # 1. Quick Scan & Fingerprinting
            self.update(job, stage="quick_scan", progress=8, message="Fingerprinting source and evaluating duplicates")
            if not source.exists():
                raise FileNotFoundError(f"Source file not found: {source}")

            job.source_hash = sha256_file(source)

            # Check duplicate against existing books
            existing_books = self.catalog.list_books()
            duplicate_eval = evaluate_duplicate(
                source_hash=job.source_hash,
                title=job.detected_title or source.stem,
                subject_id=job.subject_id or "physics",
                paper=job.paper_number or 1,
                publisher=job.detected_publisher,
                edition=job.detected_edition,
                page_count=0,
                existing_books=existing_books,
            )
            job.duplicate_info = duplicate_eval
            self.store.put(job)

            ext = source.suffix.lower()
            book_record: dict | None = None
            item_source = None

            # 2. PDF Structure Analysis
            self.update(job, stage="structure", progress=18, message="Analyzing PDF structure, TOC, chapters, and cover candidates")
            if ext == ".pdf":
                cover_dir = settings.inbox_dir / "generated" / job.id / "covers"
                hints = {
                    "suggested_subject": job.subject_id,
                    "suggested_paper": job.paper_number,
                    "title": job.detected_title,
                }
                analysis = analyze_pdf(source, cover_output_dir=cover_dir, hints=hints)

                # Re-evaluate duplicate with exact page count & analysis title
                duplicate_eval = evaluate_duplicate(
                    source_hash=job.source_hash,
                    title=job.detected_title or analysis.title or source.stem,
                    subject_id=job.subject_id or analysis.subject_hint or "physics",
                    paper=job.paper_number or analysis.paper_hint or 1,
                    publisher=job.detected_publisher or analysis.publisher,
                    edition=job.detected_edition or analysis.edition,
                    page_count=analysis.page_count,
                    existing_books=existing_books,
                )
                job.duplicate_info = duplicate_eval

                job.detected_chapters = len(analysis.chapters)
                item_source = iter(analysis.formula_candidates)
                job.detected_formulas = len(analysis.formula_candidates)
                job.subject_id = job.subject_id or analysis.subject_hint
                job.paper_number = job.paper_number or analysis.paper_hint
                job.detected_title = job.detected_title or analysis.title
                job.detected_publisher = job.detected_publisher or analysis.publisher
                job.detected_edition = job.detected_edition or analysis.edition
                job.confidence_scores = analysis.confidence_scores
                job.provenance = analysis.provenance
                job.cover_candidates = analysis.cover_candidates
                self.store.put(job)

                # Determine Book ID & Version ID (support new version linkage if detected)
                if duplicate_eval.duplicate_type == "POSSIBLE_NEW_VERSION" and duplicate_eval.existing_book_id:
                    book_id = duplicate_eval.existing_book_id
                else:
                    book_id = str(uuid.uuid4())
                book_version_id = str(uuid.uuid4())

                # 3. Store Original in Warehouse (10_ORIGINALS/)
                logical_original = f"10_ORIGINALS/{book_id}/{source.name}"
                self.update(job, stage="origin_upload", progress=31, message="Storing original PDF in private warehouse")
                original_obj = self.storage.put(
                    source,
                    logical_original,
                    public=False,
                    metadata={"bookId": book_id, "kind": "original", "importJobId": job.id},
                )

                # 4. Store Selected Cover Candidate (50_COVERS/)
                selected_cover_cand = next((c for c in analysis.cover_candidates if c.is_selected), None)
                cover_obj = None
                if selected_cover_cand and selected_cover_cand.preview_url:
                    cover_img_path = Path(selected_cover_cand.preview_url)
                    if cover_img_path.exists():
                        self.update(job, stage="cover", progress=38, message="Storing selected cover asset in warehouse")
                        cover_obj = self.storage.put(
                            cover_img_path,
                            f"50_COVERS/{book_id}/cover.png",
                            public=True,
                            metadata={"bookId": book_id, "kind": "cover", "page": selected_cover_cand.page_number},
                        )

                # 5. Build Encrypted HSCP Package (20_SECURE_BOOKS/)
                self.update(job, stage="pack", progress=52, message="Building streaming encrypted AES-256-GCM HSCP package")
                secure_dir = settings.inbox_dir / "generated" / job.id
                secure_dir.mkdir(parents=True, exist_ok=True)
                hscp_path = secure_dir / f"{book_id}-v1.hscp"
                hscp = build_hscp(
                    source,
                    hscp_path,
                    book_id=book_id,
                    version=1,
                    chunk_size=settings.default_chunk_size,
                )

                if settings.content_master_key_b64:
                    wrapped = wrap_content_key_for_server(
                        hscp.content_key,
                        settings.content_master_key_b64,
                        settings.content_master_key_version,
                    )
                else:
                    wrapped = {
                        "demo_content_key_b64": base64.b64encode(hscp.content_key).decode("ascii"),
                        "warning": "Set CONTENT_MASTER_KEY_B64 before production",
                    }

                secure_obj = self.storage.put(
                    hscp_path,
                    f"20_SECURE_BOOKS/{book_id}/v1.hscp",
                    public=settings.google_drive_public_packages,
                    metadata={"bookId": book_id, "kind": "hscp", "version": 1},
                )

                # 6. Build Standalone Search Pack for Text Books
                search_pack_obj = None
                if not analysis.is_scanned and analysis.page_texts:
                    self.update(job, stage="search", progress=68, message="Building SQLite FTS5 full-text search pack")
                    search_dir = secure_dir / "search"
                    search_dir.mkdir(parents=True, exist_ok=True)
                    # Create temporary staging for FTS5 index
                    temp_staging = StagingContentStore(search_dir / "temp_search.sqlite")
                    for p_num, p_text in analysis.page_texts.items():
                        temp_staging.ingest([ContentItem(
                            type="note",
                            subject=job.subject_id or "physics",
                            title=f"Page {p_num}",
                            latex=p_text[:100],
                            question=p_text,
                            chapter=f"page_{p_num}",
                            source=f"p{p_num}",
                        )])
                    search_info = build_search_index(temp_staging, search_dir / f"{book_id}.sqlite")
                    temp_staging.close()
                    search_pack_obj = self.storage.put(
                        Path(search_info["path"]),
                        f"40_SEARCH_INDEXES/{book_id}/search.pack",
                        public=False,
                        metadata={"bookId": book_id, "kind": "search-index"},
                    )

                book_record = {
                    "id": book_id,
                    "book_version_id": book_version_id,
                    "title": job.detected_title or analysis.title or source.stem,
                    "subtitle": f"HSC {(job.subject_id or 'physics').capitalize()} Paper {job.paper_number or 1}",
                    "publisher": job.detected_publisher or analysis.publisher or "NCTB Approved",
                    "edition": job.detected_edition or analysis.edition,
                    "subject_id": job.subject_id or "physics",
                    "paper": job.paper_number or 1,
                    "is_protected": True,
                    "is_published": False,
                    "chapter_count": len(analysis.chapters),
                    "formula_count": len(analysis.formula_candidates),
                    "page_count": analysis.page_count,
                    "version": 1,
                    "package_sha256": hscp.sha256,
                    "source_hash": job.source_hash,
                    "cover_url": cover_obj.delivery_url if cover_obj else None,
                    "cover_thumbnail_url": cover_obj.delivery_url if cover_obj else None,
                    "original_object": original_obj.model_dump(),
                    "secure_object": secure_obj.model_dump(),
                    "search_object": search_pack_obj.model_dump() if search_pack_obj else None,
                    "server_wrapped_content_key": wrapped,
                    "chapters": [x.model_dump() for x in analysis.chapters],
                    "text_ratio": analysis.text_ratio,
                    "is_scanned": analysis.is_scanned,
                    "rights_status": job.rights_status,
                    "distribution_allowed": job.distribution_allowed,
                    "offline_download_allowed": job.offline_download_allowed,
                    "confidence_scores": analysis.confidence_scores,
                    "provenance": analysis.provenance,
                    "import_group_id": job.import_group_id,
                }
                self.catalog.upsert_book(book_record)
            else:
                self.update(job, stage="extract", progress=34, message="Streaming structured content into disk-backed staging")
                item_source = iter_content_file(source)

            # 7. Normalize & Stage Structured Items
            self.update(job, stage="extract", progress=65, message="Normalizing and deduplicating on disk")
            staging_path = settings.inbox_dir / "generated" / job.id / "staging.sqlite"
            stage_store = StagingContentStore(staging_path)
            stage_store.ingest(item_source or iter(()))

            job.total_items = stage_store.total
            job.processed_items = stage_store.unique_count
            job.failed_items = stage_store.invalid
            job.detected_formulas = stage_store.count_type("formula")
            job.detected_cqs = stage_store.count_type("cq")
            job.detected_mcqs = stage_store.count_type("mcq")
            self.store.put(job)

            manifests: list[dict] = []
            if stage_store.unique_count:
                self.update(job, stage="pack", progress=80, message="Building streamed content packs and search index")
                pack_dir = settings.inbox_dir / "generated" / job.id / "packs"
                manifests = build_content_packs(stage_store, pack_dir, job.id)
                published_packs = []
                for manifest in manifests:
                    pack_path = Path(manifest["path"])
                    obj = self.storage.put(
                        pack_path,
                        f"packs/{manifest['key']}/{pack_path.name}",
                        public=False,
                        metadata={"importId": job.id, "kind": "content-pack"},
                    )
                    catalog_id = self.catalog.upsert_pack(manifest, obj.model_dump(), job.id)
                    published_packs.append({**manifest, "catalog_id": catalog_id, "storage": obj.model_dump()})
                manifests = published_packs

            # 8. Publication Quality Gate & Readiness Evaluation
            self.update(job, stage="validation", progress=90, message="Evaluating readiness and publication quality gates")
            blocking_issues: list[str] = []
            warnings: list[str] = []

            if book_record:
                blocking_issues, warnings = self.catalog.validate_book_publication(book_record["id"], book_record["book_version_id"])

            job.blocking_issues = blocking_issues
            job.warnings = warnings

            self.update(job, stage="review", progress=95, message="Preparing review summary")
            result = {
                "book": book_record,
                "packs": manifests,
                "duplicate_items_removed": stage_store.duplicates,
                "invalid_items": stage_store.invalid,
                "review_required": True,
                "rights_check_required": True,
                "production_key_ready": bool(settings.content_master_key_b64),
                "ocr_recommended": bool(book_record and book_record.get("is_scanned")),
                "duplicate_info": job.duplicate_info.model_dump(),
                "blocking_issues": blocking_issues,
                "warnings": warnings,
            }
            job.result = result
            job.status = "ready_for_review"
            job.progress = 100
            job.stage = "ready_for_review"
            job.lease_worker_id = None
            job.lease_expires_at = None
            job.message = "Processing complete — ready for admin review"
            self.store.put(job)
            return job
        except Exception as exc:
            job.status = "failed"
            job.stage = "failed"
            job.error = f"{type(exc).__name__}: {exc}"
            job.message = "Import failed"
            job.lease_worker_id = None
            job.lease_expires_at = None
            self.store.put(job)
            return job
        finally:
            if stage_store is not None:
                try:
                    stage_store.close()
                except Exception:
                    pass

    def publish(
        self,
        job: ImportJob,
        rights_confirmed: bool,
        rights_status: str = "LICENSED",
        distribution_allowed: bool = True,
    ) -> ImportJob:
        if job.status != "ready_for_review":
            raise ValueError("Job is not ready for publication")
        if not rights_confirmed:
            raise ValueError(
                "Publication requires explicit confirmation that distribution rights/permission are available"
            )
        if rights_status == "UNVERIFIED" or not distribution_allowed:
            raise ValueError("Cannot publish book with UNVERIFIED rights status or disabled distribution")

        book = job.result.get("book") or {}
        packs = job.result.get("packs") or []
        self.catalog.publish_import(
            book.get("id"),
            book.get("book_version_id"),
            [x.get("catalog_id") for x in packs if x.get("catalog_id")],
            job.id,
            rights_status=rights_status,
            distribution_allowed=distribution_allowed,
        )
        job.status = "published"
        job.stage = "published"
        job.progress = 100
        job.rights_status = rights_status
        job.distribution_allowed = distribution_allowed
        job.offline_download_allowed = distribution_allowed
        job.message = "Published atomically to mobile catalog"
        job.result["published"] = True
        self.store.put(job)
        return job
