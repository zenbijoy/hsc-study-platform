from __future__ import annotations

import os
import threading
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Header, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.catalog import get_catalog
from app.config import settings
from app.discovery import GoogleDriveInboxDiscovery, LocalFolderDiscovery
from app.job_store import JobStore
from app.models import (
    AccessMode,
    BookStatus,
    ChapterCandidate,
    DiscoverySummary,
    ImportGroup,
    ImportJob,
    ImportSourceType,
    IssueCategory,
    IssueStatus,
    JobPriority,
    ProcessingProfile,
    QualitySummary,
    RightsStatus,
)
from app.pipeline import ContentPipeline

app = FastAPI(title="HSC Content Factory & CMS", version="0.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

store = JobStore(settings.job_db)
catalog = get_catalog()
stop_event = threading.Event()
resumable_sessions: dict[str, dict[str, Any]] = {}


# --- Request Models ---

class TextImportRequest(BaseModel):
    name: str = "agent-import.jsonl"
    format: str = Field(default="jsonl", pattern="^(jsonl|txt|md|json|csv)$")
    content: str


class PublishRequest(BaseModel):
    rights_confirmed: bool = False
    rights_status: RightsStatus = "LICENSED"
    distribution_allowed: bool = True
    actor: str = "admin@hscstudy.internal"


class BulkPublishRequest(BaseModel):
    job_ids: list[str] = Field(default_factory=list)
    book_ids: list[str] = Field(default_factory=list)
    rights_confirmed: bool = False
    rights_status: RightsStatus = "LICENSED"
    distribution_allowed: bool = True
    actor: str = "admin@hscstudy.internal"


class PublishValidateRequest(BaseModel):
    job_ids: list[str] = Field(default_factory=list)
    book_ids: list[str] = Field(default_factory=list)


class RollbackRequest(BaseModel):
    target_version_id: str
    reason: str | None = None
    actor: str = "admin@hscstudy.internal"


class UnpublishRequest(BaseModel):
    reason: str | None = None
    actor: str = "admin@hscstudy.internal"


class ArchiveRequest(BaseModel):
    reason: str | None = None
    actor: str = "admin@hscstudy.internal"


class BookMetadataUpdateRequest(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    subject_id: str | None = None
    paper: int | None = None
    publisher: str | None = None
    edition: str | None = None
    description: str | None = None
    academic_year: str | None = None
    tags: list[str] | None = None
    authors: list[str] | None = None
    rights_status: RightsStatus | None = None
    distribution_allowed: bool | None = None
    online_reading_allowed: bool | None = None
    offline_download_allowed: bool | None = None
    cover_url: str | None = None
    access_mode: AccessMode | None = None
    version_token: int | None = None
    actor: str = "admin@hscstudy.internal"
    reason: str | None = None


class ChapterRevisionSaveRequest(BaseModel):
    chapters: list[dict[str, Any]]
    source: str = "ADMIN_MANUAL"
    actor: str = "admin@hscstudy.internal"


class IssueCreateRequest(BaseModel):
    book_id: str
    book_version_id: str | None = None
    page_number: int | None = None
    category: IssueCategory = "OTHER"
    priority: str = "NORMAL"
    message: str
    reporter_email: str | None = None


class IssueUpdateRequest(BaseModel):
    status: IssueStatus | None = None
    priority: str | None = None
    resolution_notes: str | None = None


class SearchTestRequest(BaseModel):
    query: str


class PageShiftRequest(BaseModel):
    book_version_id: str
    offset: int
    chapter_number: int | None = None


class ReviewUpdateRequest(BaseModel):
    title: str | None = None
    subject_id: str | None = None
    paper_number: int | None = None
    publisher: str | None = None
    edition: str | None = None
    chapters: list[dict[str, Any]] | None = None
    selected_cover_page: int | None = None
    rights_status: RightsStatus | None = None
    distribution_allowed: bool | None = None


class BatchMutateRequest(BaseModel):
    job_ids: list[str] = Field(default_factory=list)
    book_ids: list[str] = Field(default_factory=list)
    subject_id: str | None = None
    paper_number: int | None = None
    rights_status: RightsStatus | None = None
    distribution_allowed: bool | None = None
    priority: JobPriority | None = None


class ResumableSessionRequest(BaseModel):
    filename: str
    file_size: int
    subject_hint: str | None = None
    paper_hint: int | None = None
    import_group_id: str | None = None
    book_id: str | None = None
    priority: JobPriority = "NORMAL"
    profile: ProcessingProfile = "STANDARD"


class DiscoverFolderRequest(BaseModel):
    folder_path: str
    recursive: bool = True
    subject_override: str | None = None
    paper_override: int | None = None


class DiscoverDriveRequest(BaseModel):
    inbox_folder_id: str | None = None


class BatchImportRequest(BaseModel):
    group_name: str = "Bulk Import Batch"
    source_type: ImportSourceType = "local_folder"
    candidates: list[dict[str, Any]] = Field(default_factory=list)
    defaults: dict[str, Any] = Field(default_factory=dict)
    priority: JobPriority = "NORMAL"
    profile: ProcessingProfile = "STANDARD"


# --- Worker Loop with Priority & Lease Heartbeats ---

def worker_loop(slot: int):
    worker_id = f"worker-slot-{slot}-{os.getpid()}"
    pipeline = ContentPipeline(store)
    while not stop_event.is_set():
        job = store.next_queued(worker_id=worker_id, lease_seconds=settings.job_lease_duration_seconds)
        if job:
            pipeline.process(job)
        else:
            stop_event.wait(0.45)


@app.on_event("startup")
def startup():
    stop_event.clear()
    for i in range(max(1, min(settings.worker_concurrency, 8))):
        threading.Thread(target=worker_loop, args=(i,), name=f"hsc-content-worker-{i}", daemon=True).start()


@app.on_event("shutdown")
def shutdown():
    stop_event.set()


@app.get("/health")
def health():
    return {
        "ok": True,
        "storage": settings.storage_provider,
        "version": "0.4.0",
        "worker_concurrency": settings.worker_concurrency,
        "max_upload_bytes": settings.max_upload_bytes,
        "ai_enabled": settings.ai_enabled,
    }


# --- Phase 16 Book CMS Endpoints ---

@app.get("/v1/books")
def list_books_catalog(
    offset: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=200),
    search: str | None = None,
    status: str | None = None,
    subject_id: str | None = None,
    paper: int | None = None,
    rights_status: str | None = None,
    reader_ready: bool | None = None,
    search_ready: bool | None = None,
    chapter_map_ready: bool | None = None,
    sort_by: str = Query("updated_at"),
    sort_order: str = Query("desc"),
):
    books, total = catalog.list_books_paginated(
        offset=offset,
        limit=limit,
        search=search,
        status=status,
        subject_id=subject_id,
        paper=paper,
        rights_status=rights_status,
        reader_ready=reader_ready,
        search_ready=search_ready,
        chapter_map_ready=chapter_map_ready,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return {
        "items": books,
        "total": total,
        "offset": offset,
        "limit": limit,
    }


@app.get("/v1/books/{book_id}")
def get_book_details(book_id: str):
    book = catalog.get_book_full(book_id)
    if not book:
        raise HTTPException(404, f"Book {book_id} not found")
    return book


@app.patch("/v1/books/{book_id}")
def update_book(book_id: str, request: BookMetadataUpdateRequest):
    updates = request.model_dump(exclude_none=True)
    actor = updates.pop("actor", "admin@hscstudy.internal")
    reason = updates.pop("reason", None)
    try:
        updated = catalog.update_book_metadata(book_id, updates, actor=actor, reason=reason)
        return updated
    except ValueError as exc:
        raise HTTPException(409, str(exc)) from exc


@app.post("/v1/books/{book_id}/versions/{version_id}/chapters")
def save_chapter_revision_endpoint(book_id: str, version_id: str, request: ChapterRevisionSaveRequest):
    try:
        return catalog.save_chapter_revision(
            book_id=book_id,
            version_id=version_id,
            chapters=request.chapters,
            source=request.source,
            actor=request.actor,
        )
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc


@app.post("/v1/books/{book_id}/versions/{version_id}/publish")
def publish_book_version_endpoint(book_id: str, version_id: str, request: PublishRequest):
    try:
        catalog.publish_book_version(
            book_id=book_id,
            version_id=version_id,
            rights_confirmed=request.rights_confirmed,
            rights_status=request.rights_status,
            distribution_allowed=request.distribution_allowed,
            actor=request.actor,
        )
        return {"ok": True, "book_id": book_id, "published_version_id": version_id}
    except ValueError as exc:
        raise HTTPException(409, str(exc)) from exc


@app.post("/v1/books/{book_id}/rollback")
def rollback_book(book_id: str, request: RollbackRequest):
    try:
        catalog.rollback_book_version(
            book_id=book_id,
            target_version_id=request.target_version_id,
            reason=request.reason,
            actor=request.actor,
        )
        return {"ok": True, "book_id": book_id, "active_version_id": request.target_version_id}
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc


@app.post("/v1/books/{book_id}/unpublish")
def unpublish_book(book_id: str, request: UnpublishRequest = UnpublishRequest()):
    try:
        catalog.unpublish_book(book_id=book_id, reason=request.reason, actor=request.actor)
        return {"ok": True, "book_id": book_id, "is_published": False}
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc


@app.post("/v1/books/{book_id}/archive")
def archive_book(book_id: str, request: ArchiveRequest = ArchiveRequest()):
    try:
        catalog.archive_book(book_id=book_id, actor=request.actor)
        return {"ok": True, "book_id": book_id, "status": "ARCHIVED"}
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc


@app.get("/v1/books/{book_id}/pages/{page_num}/preview")
def get_page_preview(book_id: str, page_num: int):
    book = catalog.get_book(book_id)
    if not book:
        raise HTTPException(404, f"Book {book_id} not found")
    # Return mock preview text & page structure safely
    return {
        "book_id": book_id,
        "page_number": page_num,
        "extracted_text": f"Extracted text content from page {page_num} of {book.get('title')}...",
        "ocr_confidence": 0.94,
        "has_images": True,
        "linked_formulas_count": 2,
        "linked_cq_count": 1,
    }


@app.post("/v1/books/{book_id}/pages/{page_num}/search-test")
def search_test_endpoint(book_id: str, page_num: int, request: SearchTestRequest):
    return {
        "query": request.query,
        "total_matches": 3,
        "results": [
            {"page": page_num, "snippet": f"... {request.query} formula and proof ...", "score": 0.95},
            {"page": max(1, page_num - 2), "snippet": f"... introduction to {request.query} ...", "score": 0.88},
        ],
    }


# --- Quality Control & Issues Endpoints ---

@app.get("/v1/quality/summary", response_model=QualitySummary)
def get_quality_summary_endpoint():
    return catalog.get_quality_summary()


@app.get("/v1/issues")
def list_issues_endpoint(book_id: str | None = None, status: str | None = None):
    return catalog.list_issues(book_id=book_id, status=status)


@app.post("/v1/issues")
def create_issue_endpoint(request: IssueCreateRequest):
    return catalog.create_issue(request.model_dump())


@app.patch("/v1/issues/{issue_id}")
def update_issue_endpoint(issue_id: str, request: IssueUpdateRequest):
    try:
        return catalog.update_issue(issue_id, request.model_dump(exclude_none=True))
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc


# --- Resumable Chunked Upload Endpoints ---

@app.post("/v1/uploads/pdf/session")
def create_resumable_session(request: ResumableSessionRequest):
    if request.file_size > settings.max_upload_bytes:
        raise HTTPException(413, f"File size {request.file_size} exceeds max {settings.max_upload_bytes} bytes")

    session_id = str(uuid.uuid4())
    safe_name = Path(request.filename).name
    temp_target = settings.inbox_dir / "sessions" / session_id / safe_name
    temp_target.parent.mkdir(parents=True, exist_ok=True)

    resumable_sessions[session_id] = {
        "filename": safe_name,
        "file_size": request.file_size,
        "bytes_written": 0,
        "target_path": str(temp_target),
        "subject_hint": request.subject_hint,
        "paper_hint": request.paper_hint,
        "import_group_id": request.import_group_id,
        "book_id": request.book_id,
        "priority": request.priority,
        "profile": request.profile,
    }

    return {
        "session_id": session_id,
        "chunk_size": 8 * 1024 * 1024,
        "upload_url": f"/v1/uploads/pdf/{session_id}/chunk",
    }


@app.put("/v1/uploads/pdf/{session_id}/chunk")
async def upload_chunk(
    session_id: str,
    request: Request,
    content_range: str | None = Header(None),
):
    session = resumable_sessions.get(session_id)
    if not session:
        raise HTTPException(404, "Resumable session not found or expired")

    target = Path(session["target_path"])
    chunk_data = await request.body()
    chunk_len = len(chunk_data)

    with target.open("ab") as f:
        f.write(chunk_data)

    session["bytes_written"] += chunk_len
    return {
        "bytes_received": session["bytes_written"],
        "total_bytes": session["file_size"],
        "is_complete": session["bytes_written"] >= session["file_size"],
    }


@app.post("/v1/uploads/pdf/{session_id}/complete", response_model=ImportJob)
def complete_resumable_upload(session_id: str):
    session = resumable_sessions.pop(session_id, None)
    if not session:
        raise HTTPException(404, "Resumable session not found")

    target = Path(session["target_path"])
    if not target.exists() or target.stat().st_size != session["file_size"]:
        raise HTTPException(400, "File size mismatch or incomplete chunks")

    job_id = str(uuid.uuid4())
    job = ImportJob(
        id=job_id,
        source_name=session["filename"],
        source_type="pdf",
        source_path=str(target),
        status="queued",
        stage="upload",
        priority=session.get("priority", "NORMAL"),
        profile=session.get("profile", "STANDARD"),
        import_group_id=session.get("import_group_id"),
        progress=1,
        subject_id=session.get("subject_hint"),
        paper_number=session.get("paper_hint"),
        message="Resumable upload complete; queued for processing",
    )
    store.put(job)
    return job


# --- Content Factory Discovery Endpoints ---

@app.post("/v1/content-factory/discover/folder", response_model=DiscoverySummary)
def discover_folder(request: DiscoverFolderRequest):
    discovery = LocalFolderDiscovery()
    try:
        return discovery.discover(request.folder_path, recursive=request.recursive)
    except Exception as exc:
        raise HTTPException(400, str(exc)) from exc


@app.post("/v1/content-factory/discover/drive", response_model=DiscoverySummary)
def discover_drive(request: DiscoverDriveRequest):
    discovery = GoogleDriveInboxDiscovery()
    try:
        return discovery.discover(request.inbox_folder_id or "")
    except Exception as exc:
        raise HTTPException(400, str(exc)) from exc


@app.post("/v1/content-factory/import/batch")
def batch_import(request: BatchImportRequest):
    group_id = str(uuid.uuid4())
    group = ImportGroup(
        id=group_id,
        name=request.group_name,
        source_type=request.source_type,
        status="active",
        total_files=len(request.candidates),
    )
    store.create_group(group)

    created_jobs: list[ImportJob] = []
    defaults = request.defaults or {}

    for cand in request.candidates:
        job_id = str(uuid.uuid4())
        src_path = cand.get("source_path")
        hints = cand.get("hints") or {}

        job = ImportJob(
            id=job_id,
            source_name=cand.get("filename") or Path(src_path).name,
            source_type=cand.get("source_type") or "pdf",
            source_path=src_path,
            status="queued",
            stage="upload",
            priority=request.priority,
            profile=request.profile,
            import_group_id=group_id,
            progress=1,
            subject_id=hints.get("suggested_subject") or defaults.get("subject"),
            paper_number=hints.get("suggested_paper") or defaults.get("paper"),
            rights_status=hints.get("rights_status") or defaults.get("rightsStatus", "UNVERIFIED"),
            distribution_allowed=hints.get("distribution_allowed", defaults.get("distributionAllowed", False)),
            offline_download_allowed=hints.get("offline_download_allowed", defaults.get("offlineDownloadAllowed", False)),
            message=f"Batch import candidate from {request.group_name}",
        )
        store.put(job)
        created_jobs.append(job)

    return {
        "group_id": group_id,
        "group_name": request.group_name,
        "total_enqueued": len(created_jobs),
        "jobs": [j.id for j in created_jobs],
    }


# --- Import Group Endpoints ---

@app.get("/v1/content-factory/groups", response_model=list[ImportGroup])
def list_import_groups(limit: int = 50):
    return store.list_groups(limit)


@app.get("/v1/content-factory/groups/{group_id}", response_model=ImportGroup)
def get_import_group(group_id: str):
    grp = store.get_group(group_id)
    if not grp:
        raise HTTPException(404, "Import group not found")
    return grp


# --- Content Factory Job Endpoints ---

@app.get("/v1/content-factory/jobs", response_model=list[ImportJob])
@app.get("/v1/imports", response_model=list[ImportJob])
def list_jobs(limit: int = 100, status: str | None = None, group_id: str | None = None):
    return store.list_recent(min(max(limit, 1), 1000), status=status, group_id=group_id)


@app.get("/v1/content-factory/jobs/{job_id}", response_model=ImportJob)
@app.get("/v1/imports/{job_id}", response_model=ImportJob)
def get_job(job_id: str):
    job = store.get(job_id)
    if not job:
        raise HTTPException(404, "Import job not found")
    return job


@app.post("/v1/content-factory/jobs/{job_id}/retry", response_model=ImportJob)
def retry_job(job_id: str, stage: str | None = None):
    job = store.retry(job_id, target_stage=stage)
    if not job:
        raise HTTPException(404, "Import job not found")
    return job


@app.post("/v1/content-factory/jobs/{job_id}/cancel", response_model=ImportJob)
def cancel_job(job_id: str):
    job = store.cancel(job_id)
    if not job:
        raise HTTPException(404, "Import job not found")
    return job


@app.patch("/v1/content-factory/jobs/{job_id}/review", response_model=ImportJob)
@app.patch("/v1/imports/{job_id}/review", response_model=ImportJob)
def update_job_review(job_id: str, request: ReviewUpdateRequest):
    job = store.get(job_id)
    if not job:
        raise HTTPException(404, "Import job not found")
    if job.status != "ready_for_review":
        raise HTTPException(409, "Can only update review metadata when job is ready_for_review")

    book = job.result.get("book") or {}
    if request.title:
        job.detected_title = request.title
        book["title"] = request.title
    if request.subject_id:
        job.subject_id = request.subject_id
        book["subject_id"] = request.subject_id
    if request.paper_number:
        job.paper_number = request.paper_number
        book["paper"] = request.paper_number
    if request.publisher:
        job.detected_publisher = request.publisher
        book["publisher"] = request.publisher
    if request.edition:
        job.detected_edition = request.edition
        book["edition"] = request.edition
    if request.chapters:
        book["chapters"] = request.chapters
        book["chapter_count"] = len(request.chapters)
        job.detected_chapters = len(request.chapters)
    if request.selected_cover_page:
        job.selected_cover_page = request.selected_cover_page
        book["selected_cover_page"] = request.selected_cover_page
    if request.rights_status:
        job.rights_status = request.rights_status
        book["rights_status"] = request.rights_status
    if request.distribution_allowed is not None:
        job.distribution_allowed = request.distribution_allowed
        book["distribution_allowed"] = request.distribution_allowed

    # Re-evaluate validation issues
    if book.get("id"):
        catalog.upsert_book(book)
        blocking, warnings = catalog.validate_book_publication(book["id"], book.get("book_version_id"))
        job.blocking_issues = blocking
        job.warnings = warnings
        job.result["blocking_issues"] = blocking
        job.result["warnings"] = warnings

    job.result["book"] = book
    store.put(job)
    return job


# --- Batch Mutations & Publishing Endpoints ---

@app.post("/v1/content-factory/batch/mutate")
def batch_mutate(request: BatchMutateRequest):
    updated_jobs = []
    for jid in request.job_ids:
        job = store.get(jid)
        if not job:
            continue
        if request.subject_id:
            job.subject_id = request.subject_id
            if job.result.get("book"):
                job.result["book"]["subject_id"] = request.subject_id
        if request.paper_number:
            job.paper_number = request.paper_number
            if job.result.get("book"):
                job.result["book"]["paper"] = request.paper_number
        if request.rights_status:
            job.rights_status = request.rights_status
            if job.result.get("book"):
                job.result["book"]["rights_status"] = request.rights_status
        if request.distribution_allowed is not None:
            job.distribution_allowed = request.distribution_allowed
            if job.result.get("book"):
                job.result["book"]["distribution_allowed"] = request.distribution_allowed
        if request.priority:
            job.priority = request.priority
        store.put(job)
        updated_jobs.append(job.id)

    # Also mutate any direct book IDs
    for bid in request.book_ids:
        book_updates = {}
        if request.subject_id:
            book_updates["subject_id"] = request.subject_id
        if request.paper_number:
            book_updates["paper"] = request.paper_number
        if request.rights_status:
            book_updates["rights_status"] = request.rights_status
        if request.distribution_allowed is not None:
            book_updates["distribution_allowed"] = request.distribution_allowed
        if book_updates:
            try:
                catalog.update_book_metadata(bid, book_updates)
            except Exception:
                pass

    return {"updated_count": len(updated_jobs) + len(request.book_ids), "job_ids": updated_jobs}


@app.post("/v1/content-factory/publish/validate")
def validate_publish_batch(request: PublishValidateRequest):
    results = []
    ready_count = 0
    blocked_count = 0

    # Validate jobs
    for jid in request.job_ids:
        job = store.get(jid)
        if not job or job.status != "ready_for_review":
            blocked_count += 1
            results.append({"id": jid, "type": "job", "ready": False, "blocking_issues": ["Job is not ready_for_review"]})
            continue

        book = job.result.get("book") or {}
        book_id = book.get("id")
        if not book_id:
            blocked_count += 1
            results.append({"id": jid, "type": "job", "ready": False, "blocking_issues": ["No book record generated"]})
            continue

        blocking, warnings = catalog.validate_book_publication(book_id, book.get("book_version_id"))
        is_ready = len(blocking) == 0
        if is_ready:
            ready_count += 1
        else:
            blocked_count += 1

        results.append({
            "id": jid,
            "type": "job",
            "book_title": book.get("title"),
            "ready": is_ready,
            "blocking_issues": blocking,
            "warnings": warnings,
        })

    # Validate direct book IDs
    for bid in request.book_ids:
        book = catalog.get_book(bid)
        if not book:
            blocked_count += 1
            results.append({"id": bid, "type": "book", "ready": False, "blocking_issues": ["Book not found"]})
            continue
        blocking, warnings = catalog.validate_book_publication(bid, book.get("published_version_id"))
        is_ready = len(blocking) == 0
        if is_ready:
            ready_count += 1
        else:
            blocked_count += 1
        results.append({
            "id": bid,
            "type": "book",
            "book_title": book.get("title"),
            "ready": is_ready,
            "blocking_issues": blocking,
            "warnings": warnings,
        })

    return {
        "total_selected": len(request.job_ids) + len(request.book_ids),
        "ready_count": ready_count,
        "blocked_count": blocked_count,
        "results": results,
    }


@app.post("/v1/content-factory/publish/bulk")
def publish_bulk(request: BulkPublishRequest):
    if not request.rights_confirmed:
        raise HTTPException(400, "Bulk publication requires explicit rights confirmation checkbox")
    if request.rights_status == "UNVERIFIED" or not request.distribution_allowed:
        raise HTTPException(400, "Cannot publish with UNVERIFIED rights status or disabled distribution")

    pipeline = ContentPipeline(store)
    published = []
    failed = []

    for jid in request.job_ids:
        job = store.get(jid)
        if not job:
            failed.append({"id": jid, "error": "Job not found"})
            continue
        try:
            pub_job = pipeline.publish(
                job,
                rights_confirmed=request.rights_confirmed,
                rights_status=request.rights_status,
                distribution_allowed=request.distribution_allowed,
            )
            published.append(pub_job.id)
        except Exception as exc:
            failed.append({"id": jid, "error": str(exc)})

    # Bulk publish direct book IDs
    for bid in request.book_ids:
        book = catalog.get_book(bid)
        if not book:
            failed.append({"id": bid, "error": "Book not found"})
            continue
        try:
            catalog.publish_book_version(
                book_id=bid,
                version_id=book.get("published_version_id") or book.get("book_version_id") or str(uuid.uuid4()),
                rights_confirmed=request.rights_confirmed,
                rights_status=request.rights_status,
                distribution_allowed=request.distribution_allowed,
                actor=request.actor,
            )
            published.append(bid)
        except Exception as exc:
            failed.append({"id": bid, "error": str(exc)})

    return {
        "published_count": len(published),
        "failed_count": len(failed),
        "published_ids": published,
        "failed": failed,
    }


@app.post("/v1/content-factory/jobs/{job_id}/publish", response_model=ImportJob)
@app.post("/v1/imports/{job_id}/publish", response_model=ImportJob)
def publish_single_job(job_id: str, request: PublishRequest):
    job = store.get(job_id)
    if not job:
        raise HTTPException(404, "Import job not found")
    try:
        return ContentPipeline(store).publish(
            job,
            rights_confirmed=request.rights_confirmed,
            rights_status=request.rights_status,
            distribution_allowed=request.distribution_allowed,
        )
    except ValueError as exc:
        raise HTTPException(409, str(exc)) from exc


@app.get("/v1/content/{logical_path:path}")
def local_content(logical_path: str):
    if settings.storage_provider.lower() != "local":
        raise HTTPException(404, "Local content endpoint disabled")
    root = settings.warehouse_dir.resolve()
    target = (root / logical_path).resolve()
    if root not in target.parents and target != root:
        raise HTTPException(400, "Invalid path")
    if not target.is_file():
        raise HTTPException(404, "Content not found")
    return FileResponse(target, filename=target.name, media_type="application/octet-stream")
