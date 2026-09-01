from __future__ import annotations

import gzip
import hashlib
import re
from pathlib import Path

from app.staging import StagingContentStore

try:
    import zstandard as zstd
except Exception:  # pragma: no cover
    zstd = None


def _slug(value: str) -> str:
    value = value.strip().lower().replace(" ", "-")
    value = re.sub(r"[^a-z0-9._\-\u0980-\u09ff]+", "-", value)
    return value.strip("-") or "unknown"


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        while b := f.read(1024 * 1024): h.update(b)
    return h.hexdigest()


def build_content_packs(stage: StagingContentStore, out_dir: Path, import_id: str) -> list[dict]:
    manifests: list[dict] = []
    for subject, chapter, content_type, count in stage.group_keys():
        key = f"{_slug(subject)}/{_slug(chapter)}/{_slug(content_type)}"
        base = out_dir / key
        base.mkdir(parents=True, exist_ok=True)
        if zstd:
            path = base / f"{import_id}.jsonl.zst"
            with path.open("wb") as raw, zstd.ZstdCompressor(level=10).stream_writer(raw) as compressed:
                for payload in stage.iter_payloads(subject, chapter, content_type):
                    compressed.write(payload.encode("utf-8") + b"\n")
            codec = "zstd"
        else:
            path = base / f"{import_id}.jsonl.gz"
            with gzip.open(path, "wt", encoding="utf-8", compresslevel=9) as out:
                for payload in stage.iter_payloads(subject, chapter, content_type):
                    out.write(payload); out.write("\n")
            codec = "gzip"
        manifests.append({
            "key": key,
            "path": str(path),
            "count": count,
            "sha256": _sha256_file(path),
            "codec": codec,
            "byte_size": path.stat().st_size,
        })
    return manifests
