from __future__ import annotations

import argparse
import shutil
import uuid
from pathlib import Path
from app.config import settings
from app.job_store import JobStore
from app.models import ImportJob

SUPPORTED = {".pdf", ".txt", ".md", ".jsonl", ".ndjson", ".json", ".csv"}


def main():
    parser = argparse.ArgumentParser(description="Bulk enqueue a folder of HSC source files")
    parser.add_argument("folder", type=Path)
    parser.add_argument("--recursive", action="store_true")
    args = parser.parse_args()
    folder = args.folder.resolve()
    glob = folder.rglob("*") if args.recursive else folder.glob("*")
    files = [p for p in glob if p.is_file() and p.suffix.lower() in SUPPORTED]
    store = JobStore(settings.job_db)
    print(f"Found {len(files)} supported files")
    for src in files:
        job_id = str(uuid.uuid4())
        dst = settings.inbox_dir / job_id / src.name
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        job = ImportJob(id=job_id, source_name=dst.name, source_type=dst.suffix.lstrip("."), source_path=str(dst), status="queued", message="Bulk folder import")
        store.put(job)
        print(job.id, src.name)
    print("Start `uvicorn app.api:app --port 8787` to process the queue.")


if __name__ == "__main__":
    main()
