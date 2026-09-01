from __future__ import annotations

import base64
import json
import uuid
from pathlib import Path

from app.catalog import get_catalog
from app.config import settings
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
            self.update(job, stage="quick_scan", progress=8, message="Fingerprinting source and checking duplicates")
            job.source_hash = sha256_file(source)
            self.store.put(job)

            ext = source.suffix.lower()
            book_record: dict | None = None
            item_source = None

            self.update(job, stage="structure", progress=18, message="Analyzing PDF structure, TOC and metadata")
            if ext == ".pdf":
                cover_dir = settings.inbox_dir / "generated" / job.id / "covers"
                cover_path = cover_dir / f"cover.png"
                analysis = analyze_pdf(source, cover_output_path=cover_path)
                job.detected_chapters = len(analysis.chapters)
                item_source = iter(analysis.formula_candidates)
                job.detected_formulas = len(analysis.formula_candidates)
                job.subject_id = analysis.subject_hint
                job.paper_number = analysis.paper_hint
                self.store.put(job)

                book_id = str(uuid.uuid4())
                book_version_id = str(uuid.uuid4())
                logical_original = f"10_ORIGINALS/{book_id}/{source.name}"
                self.update(job, stage="origin_upload", progress=31, message="Storing original PDF in private warehouse")
                original_obj = self.storage.put(
                    source,
                    logical_original,
                    public=False,
                    metadata={"bookId": book_id, "kind": "original"},
                )

                cover_obj = None
                if cover_path.exists():
                    self.update(job, stage="cover", progress=38, message="Storing generated cover asset")
                    cover_obj = self.storage.put(
                        cover_path,
                        f"50_COVERS/{book_id}/cover.png",
                        public=True,
                        metadata={"bookId": book_id, "kind": "cover"},
                    )

                self.update(job, stage="pack", progress=52, message="Building encrypted HSCP package")
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

                book_record = {
                    "id": book_id,
                    "book_version_id": book_version_id,
                    "title": analysis.title or source.stem,
                    "subtitle": f"HSC {analysis.subject_hint.capitalize() if analysis.subject_hint else ''} Paper {analysis.paper_hint or 1}",
                    "publisher": analysis.publisher or "NCTB Approved",
                    "subject_id": analysis.subject_hint or "physics",
                    "paper": analysis.paper_hint or 1,
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
                    "server_wrapped_content_key": wrapped,
                    "chapters": [x.model_dump() for x in analysis.chapters],
                    "text_ratio": analysis.text_ratio,
                    "is_scanned": analysis.is_scanned,
                    "rights_status": job.rights_status,
                    "distribution_allowed": job.distribution_allowed,
                    "offline_download_allowed": job.offline_download_allowed,
                }
                self.catalog.upsert_book(book_record)
            else:
                self.update(job, stage="extract", progress=34, message="Streaming structured content into disk-backed staging")
                item_source = iter_content_file(source)

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
                search_info = build_search_index(stage_store, pack_dir / "search" / f"{job.id}.sqlite")
                manifests.append(
                    {
                        "key": "unknown/unclassified/search",
                        "path": search_info["path"],
                        "count": search_info["count"],
                        "sha256": sha256_file(Path(search_info["path"])),
                        "codec": search_info["codec"],
                        "byte_size": search_info["byte_size"],
                    }
                )
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
                "streaming_staging": {
                    "path": str(staging_path),
                    "total_seen": stage_store.total,
                    "unique": stage_store.unique_count,
                },
            }
            job.result = result
            job.status = "ready_for_review"
            job.progress = 100
            job.stage = "ready_for_review"
            job.message = "Processing complete — ready for admin review"
            self.store.put(job)
            self.catalog.append(
                "imports",
                {
                    "id": job.id,
                    "source_name": job.source_name,
                    "source_hash": job.source_hash,
                    "status": job.status,
                },
            )
            return job
        except Exception as exc:
            job.status = "failed"
            job.stage = "failed"
            job.error = f"{type(exc).__name__}: {exc}"
            job.message = "Import failed"
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
        if job.result.get("book") and not job.result.get("production_key_ready") and settings.supabase_url:
            raise ValueError("Protected book cannot be published to production until CONTENT_MASTER_KEY_B64 is configured")

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
