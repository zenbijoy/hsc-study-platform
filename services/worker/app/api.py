from __future__ import annotations

import threading
import uuid
from pathlib import Path
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from app.config import settings
from app.job_store import JobStore
from app.models import ImportJob
from app.pipeline import ContentPipeline

app = FastAPI(title="HSC Content Factory", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

store = JobStore(settings.job_db)
stop_event = threading.Event()


class TextImportRequest(BaseModel):
    name: str = "agent-import.jsonl"
    format: str = Field(default="jsonl", pattern="^(jsonl|txt|md|json|csv)$")
    content: str


class PublishRequest(BaseModel):
    rights_confirmed: bool = False


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
        "version": "0.1.0",
        "worker_concurrency": settings.worker_concurrency,
    }


def _new_job(path: Path) -> ImportJob:
    job = ImportJob(
        id=path.parent.name if len(path.parent.name) >= 32 else str(uuid.uuid4()),
        source_name=path.name,
        source_type=path.suffix.lower().lstrip("."),
        source_path=str(path),
        status="queued",
        stage="upload",
        progress=1,
        message="Source staged; queued for processing",
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
    job = ImportJob(id=job_id, source_name=safe_name, source_type=suffix.lstrip("."), source_path=str(target), status="queued", stage="upload", progress=1, message="Upload complete; queued for processing")
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
    job = ImportJob(id=job_id, source_name=target.name, source_type=request.format, source_path=str(target), status="queued", stage="upload", progress=1, message="AI/text payload staged")
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


@app.post("/v1/imports/{job_id}/retry", response_model=ImportJob)
def retry(job_id: str):
    job = store.get(job_id)
    if not job:
        raise HTTPException(404, "Import job not found")
    if job.status != "failed":
        raise HTTPException(409, "Only failed jobs can be retried")
    job.status = "queued"
    job.stage = "queued"
    job.progress = 0
    job.error = None
    job.message = "Queued for retry"
    store.put(job)
    return job


@app.post("/v1/imports/{job_id}/publish", response_model=ImportJob)
def publish(job_id: str, request: PublishRequest):
    job = store.get(job_id)
    if not job:
        raise HTTPException(404, "Import job not found")
    try:
        return ContentPipeline(store).publish(job, request.rights_confirmed)
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
