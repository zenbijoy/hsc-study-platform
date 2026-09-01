from __future__ import annotations

import argparse
import json
import shutil
import uuid
from pathlib import Path

from app.config import settings
from app.discovery import LocalFolderDiscovery
from app.job_store import JobStore
from app.models import ImportGroup, ImportJob


def main():
    parser = argparse.ArgumentParser(description="Content Factory Bulk Folder Importer")
    parser.add_argument("folder", type=Path, help="Folder containing source files")
    parser.add_argument("--recursive", "-r", action="store_true", default=True, help="Recursively scan subfolders")
    parser.add_argument("--group-name", type=str, default=None, help="Name for this import batch/group")
    parser.add_argument("--subject", type=str, default=None, help="Default subject override (e.g. physics)")
    parser.add_argument("--paper", type=int, default=None, help="Default paper override (1 or 2)")
    parser.add_argument("--priority", type=str, default="NORMAL", choices=["HIGH", "NORMAL", "LOW"], help="Queue priority")
    parser.add_argument("--profile", type=str, default="STANDARD", choices=["FAST", "STANDARD", "DEEP"], help="Processing profile")
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

    discovery = LocalFolderDiscovery()
    summary = discovery.discover(folder, recursive=args.recursive)
    print(f"Discovered {len(summary.candidates)} candidates in {folder} (Unsupported: {summary.unsupported})")

    store = JobStore(settings.job_db)
    group_id = str(uuid.uuid4())
    group_name = args.group_name or f"Folder Import: {folder.name}"

    group = ImportGroup(
        id=group_id,
        name=group_name,
        source_type="local_folder",
        status="active",
        total_files=len(summary.candidates),
    )
    store.create_group(group)

    for cand in summary.candidates:
        src = Path(cand.source_path)
        job_id = str(uuid.uuid4())
        dst = settings.inbox_dir / job_id / src.name
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

        hints = cand.hints or {}
        subj = args.subject or hints.get("suggested_subject")
        pap = args.paper or hints.get("suggested_paper")
        rights = args.rights_status if args.rights_status != "UNVERIFIED" else hints.get("rights_status", "UNVERIFIED")
        dist = args.allow_distribution or hints.get("distribution_allowed", False)

        job = ImportJob(
            id=job_id,
            source_name=dst.name,
            source_type=dst.suffix.lstrip("."),
            source_path=str(dst),
            status="queued",
            stage="upload",
            priority=args.priority,
            profile=args.profile,
            import_group_id=group_id,
            progress=1,
            subject_id=subj,
            paper_number=pap,
            rights_status=rights,
            distribution_allowed=dist,
            offline_download_allowed=dist,
            message=f"Enqueued from {folder.name}",
        )
        store.put(job)
        print(f"  ✓ [{job.id[:8]}] {src.name} (Subject: {subj or 'auto'}, Paper: {pap or 'auto'}, Rights: {rights})")

    print(f"\nSuccessfully enqueued {len(summary.candidates)} files to Import Group [{group_id[:8]}] '{group_name}'.")
    print("Start the worker daemon to process: `uvicorn app.api:app --port 8787`")


if __name__ == "__main__":
    main()
