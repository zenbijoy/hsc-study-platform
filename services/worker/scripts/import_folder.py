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
    parser.add_argument("folder", type=Path, help="Folder containing source files")
    parser.add_argument("--recursive", "-r", action="store_true", help="Recursively scan subfolders")
    parser.add_argument("--subject", type=str, default=None, help="Default subject override (e.g. physics)")
    parser.add_argument("--paper", type=int, default=None, help="Default paper override (1 or 2)")
    parser.add_argument(
        "--rights-status",
        type=str,
        default="UNVERIFIED",
        choices=[
            "OWNED",
            "LICENSED",
            "OPEN_LICENSE",
            "PUBLIC_DOMAIN",
            "PUBLISHER_AUTHORIZED",
            "INTERNAL_ONLY",
            "UNVERIFIED",
        ],
        help="Rights classification status",
    )
    parser.add_argument("--allow-distribution", action="store_true", help="Allow distribution for verified content")

    args = parser.parse_args()
    folder = args.folder.resolve()
    if not folder.exists():
        print(f"Error: Folder {folder} does not exist")
        return

    glob = folder.rglob("*") if args.recursive else folder.glob("*")
    files = [p for p in glob if p.is_file() and p.suffix.lower() in SUPPORTED]
    store = JobStore(settings.job_db)
    print(f"Found {len(files)} supported files in {folder}")

    for src in files:
        job_id = str(uuid.uuid4())
        dst = settings.inbox_dir / job_id / src.name
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        job = ImportJob(
            id=job_id,
            source_name=dst.name,
            source_type=dst.suffix.lstrip("."),
            source_path=str(dst),
            status="queued",
            stage="upload",
            progress=1,
            subject_id=args.subject,
            paper_number=args.paper,
            rights_status=args.rights_status,
            distribution_allowed=args.allow_distribution,
            offline_download_allowed=args.allow_distribution,
            message=f"Bulk folder import from {folder.name}",
        )
        store.put(job)
        print(f"Enqueued [{job.id[:8]}]: {src.name} (Rights: {args.rights_status})")

    print("\nAll files enqueued. Start the worker to process: `uvicorn app.api:app --port 8787`")


if __name__ == "__main__":
    main()
