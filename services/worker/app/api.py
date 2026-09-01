from __future__ import annotations

import threading
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.catalog import get_catalog
from app.config import settings
from app.job_store import JobStore
from app.models import ImportJob, RightsStatus
from app.pipeline import ContentPipeline

app = FastAPI(title="HSC Content Factory", version="0.2.0")
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

# Active resumable sessions
resumable_sessions: dict[str, dict[str, Any]] = {}


class TextImportRequest(BaseModel):
    name: str = "agent-import.jsonl"
    format: str = Field(default="jsonl", pattern="^(jsonl|txt|md|json|csv)$")
    content: str


class PublishRequest(BaseModel):
    rights_confirmed: bool = False
    rights_status: RightsStatus = "LICENSED"
    distribution_allowed: bool = True


class RollbackRequest(BaseModel):
    target_version_id: str


class ReviewUpdateRequest(BaseModel):
    title: str | None = None
    subject_id: str | None = None
    paper_number: int | None = None
    chapters: list[dict[str, Any]] | None = None
    rights_status: RightsStatus | None = None
    distribution_allowed: bool | None = None


class ResumableSessionRequest(BaseModel):
    filename: str
    file_size: int
    subject_hint: str | None = None
    paper_hint: int | None = None


def worker_loop(slot: int):
    pipeline = ContentPipeline(store)
    while not stop_event.is_set():
        job = store.next_queued()
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
        "version": "0.2.0",
        "worker_concurrency": settings.worker_concurrency,
        "max_upload_bytes": settings.max_upload_bytes,
    }


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
        progress=1,
        subject_id=session.get("subject_hint"),
        paper_number=session.get("paper_hint"),
        message="Resumable upload complete; queued for processing",
    )
    store.put(job)
    return job


@app.post("/v1/imports/upload", response_model=ImportJob)
async def upload(file: UploadFile = File(...)):
    suffix = Path(file.filename or "source.bin").suffix.lower()
    allowed = {".pdf", ".txt", ".md", ".jsonl", ".ndjson", ".json", ".csv"}
    if suffix not in allowed:
        raise HTTPException(415, f"Unsupported file type {suffix}; allowed: {', '.join(sorted(allowed))}")
    job_id = str(uuid.uuid4())
    safe_name = Path(file.filename or f"source{suffix}").name
    target = settings.inbox_dir / job_id / safe_name
    target.parent.mkdir(parents=True, exist_ok=True)
    total = 0
    try:
        with target.open("wb") as out:
            while chunk := await file.read(1024 * 1024):
                total += len(chunk)
                if total > settings.max_upload_bytes:
                    raise HTTPException(413, "Upload exceeds MAX_UPLOAD_BYTES")
                out.write(chunk)
    except Exception:
        target.unlink(missing_ok=True)
        raise
    job = ImportJob(
        id=job_id,
        source_name=safe_name,
        source_type=suffix.lstrip("."),
        source_path=str(target),
        status="queued",
        stage="upload",
        progress=1,
        message="Upload complete; queued for processing",
    )
    store.put(job)
    return job


@app.post("/v1/imports/text", response_model=ImportJob)
def import_text(request: TextImportRequest):
    job_id = str(uuid.uuid4())
    suffix = ".jsonl" if request.format == "jsonl" else f".{request.format}"
    safe_stem = Path(request.name).stem[:80] or "agent-import"
    target = settings.inbox_dir / job_id / f"{safe_stem}{suffix}"
    target.parent.mkdir(parents=True, exist_ok=True)
    encoded = request.content.encode("utf-8")
    if len(encoded) > min(settings.max_upload_bytes, 64 * 1024 * 1024):
        raise HTTPException(413, "Text import is too large; use file upload for large datasets")
    target.write_bytes(encoded)
    job = ImportJob(
        id=job_id,
        source_name=target.name,
        source_type=request.format,
        source_path=str(target),
        status="queued",
        stage="upload",
        progress=1,
        message="AI/text payload staged",
    )
    store.put(job)
    return job


@app.get("/v1/imports/{job_id}", response_model=ImportJob)
def get_import(job_id: str):
    job = store.get(job_id)
    if not job:
        raise HTTPException(404, "Import job not found")
    return job


@app.get("/v1/imports", response_model=list[ImportJob])
def recent_imports(limit: int = 25):
    return store.list_recent(min(max(limit, 1), 100))


@app.patch("/v1/imports/{job_id}/review", response_model=ImportJob)
def update_review(job_id: str, request: ReviewUpdateRequest):
    job = store.get(job_id)
    if not job:
        raise HTTPException(404, "Import job not found")
    if job.status != "ready_for_review":
        raise HTTPException(409, "Can only update review metadata when job is ready_for_review")

    book = job.result.get("book") or {}
    if request.title:
        book["title"] = request.title
    if request.subject_id:
        book["subject_id"] = request.subject_id
    if request.paper_number:
        book["paper"] = request.paper_number
    if request.chapters:
        book["chapters"] = request.chapters
        book["chapter_count"] = len(request.chapters)
    if request.rights_status:
        job.rights_status = request.rights_status
        book["rights_status"] = request.rights_status
    if request.distribution_allowed is not None:
        job.distribution_allowed = request.distribution_allowed
        book["distribution_allowed"] = request.distribution_allowed

    job.result["book"] = book
    store.put(job)
    return job


@app.post("/v1/imports/{job_id}/publish", response_model=ImportJob)
def publish(job_id: str, request: PublishRequest):
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


@app.post("/v1/books/{book_id}/rollback")
def rollback_book(book_id: str, request: RollbackRequest):
    catalog.rollback_book_version(book_id, request.target_version_id)
    return {"ok": True, "book_id": book_id, "active_version_id": request.target_version_id}


@app.post("/v1/books/{book_id}/unpublish")
def unpublish_book(book_id: str):
    catalog.unpublish_book(book_id)
    return {"ok": True, "book_id": book_id, "is_published": False}


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
