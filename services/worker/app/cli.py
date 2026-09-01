from __future__ import annotations

import argparse
import json
import uuid
from pathlib import Path

from app.config import settings
from app.job_store import JobStore
from app.models import ImportJob
from app.pipeline import ContentPipeline


def main():
    parser = argparse.ArgumentParser(prog="hsc-worker")
    sub = parser.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("import", help="Process one local PDF/TXT/JSONL/CSV synchronously")
    p.add_argument("path", type=Path)
    args = parser.parse_args()
    if args.cmd == "import":
        path: Path = args.path.resolve()
        if not path.is_file():
            parser.error(f"Not a file: {path}")
        store = JobStore(settings.job_db)
        job = ImportJob(id=str(uuid.uuid4()), source_name=path.name, source_type=path.suffix.lstrip("."), source_path=str(path), status="processing")
        store.put(job)
        result = ContentPipeline(store).process(job)
        print(json.dumps(result.model_dump(), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
