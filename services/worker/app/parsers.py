from __future__ import annotations

import csv
import json
import re
from pathlib import Path
from typing import Iterator

from app.models import ContentItem


META_RE = re.compile(r"^@(?P<key>[a-zA-Z_]+)\s+(?P<value>.+)$")
BLOCK_RE = re.compile(r"^::(?P<type>formula|cq|mcq|note|definition|flashcard)\s*$", re.I)


def parse_jsonl(path: Path) -> Iterator[ContentItem]:
    with path.open("r", encoding="utf-8-sig") as f:
        for line_no, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
                obj.setdefault("source", f"{path.name}:{line_no}")
                yield ContentItem.model_validate(obj)
            except Exception as exc:
                yield ContentItem(type="unknown", title=f"Invalid line {line_no}", source=path.name, confidence=0.0, extra={"error": str(exc), "raw": line[:2000]})


def parse_csv_file(path: Path) -> Iterator[ContentItem]:
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        for row_no, row in enumerate(csv.DictReader(f), 2):
            clean = {k.strip(): v for k, v in row.items() if k and v not in (None, "")}
            if "paper" in clean:
                try:
                    clean["paper"] = int(clean["paper"])
                except Exception:
                    clean["paper"] = None
            if "year" in clean:
                try:
                    clean["year"] = int(clean["year"])
                except Exception:
                    clean["year"] = None
            if "importance" in clean:
                try:
                    clean["importance"] = int(clean["importance"])
                except Exception:
                    clean["importance"] = None
            clean.setdefault("source", f"{path.name}:{row_no}")
            clean.setdefault("type", infer_type(clean))
            yield ContentItem.model_validate(clean)


def infer_type(data: dict) -> str:
    if data.get("latex") or data.get("formula"):
        return "formula"
    if data.get("options"):
        return "mcq"
    if data.get("question"):
        return "cq"
    return str(data.get("type") or "note")


def _finish_block(kind: str | None, block: dict[str, str], meta: dict[str, str], source: str, idx: int):
    if not kind or not block:
        return None
    data: dict = {"type": kind, **meta, **block, "source": f"{source}:block-{idx}"}
    if "formula" in data and "latex" not in data:
        data["latex"] = data.pop("formula")
    for key in ("paper", "year", "importance", "difficulty"):
        if key in data:
            try:
                data[key] = int(data[key])
            except Exception:
                data[key] = None
    if "tags" in data and isinstance(data["tags"], str):
        data["tags"] = [x.strip() for x in data["tags"].split(",") if x.strip()]
    return ContentItem.model_validate(data)


def parse_tagged_text(path: Path) -> Iterator[ContentItem]:
    meta: dict[str, str] = {}
    current_type: str | None = None
    block: dict[str, str] = {}
    block_idx = 0

    def flush():
        nonlocal block, block_idx
        block_idx += 1
        item = _finish_block(current_type, block, meta, path.name, block_idx)
        block = {}
        return item

    with path.open("r", encoding="utf-8-sig") as f:
        for raw in f:
            line = raw.rstrip("\n")
            m = META_RE.match(line.strip())
            if m and current_type is None:
                meta[m.group("key")] = m.group("value").strip()
                continue
            b = BLOCK_RE.match(line.strip())
            if b:
                item = flush()
                if item:
                    yield item
                current_type = b.group("type").lower()
                continue
            if current_type:
                if ":" in line:
                    key, value = line.split(":", 1)
                    block[key.strip()] = value.strip()
                elif line.strip():
                    key = "question" if current_type in ("cq", "mcq") else "title"
                    block[key] = (block.get(key, "") + "\n" + line.strip()).strip()
        item = flush()
        if item:
            yield item


def iter_content_file(path: Path):
    ext = path.suffix.lower()
    if ext in {".jsonl", ".ndjson"}:
        return parse_jsonl(path)
    if ext == ".csv":
        return parse_csv_file(path)
    if ext in {".txt", ".md"}:
        return parse_tagged_text(path)
    if ext == ".json":
        data = json.loads(path.read_text("utf-8-sig"))
        if isinstance(data, dict) and "content" in data:
            data = data["content"]
        if not isinstance(data, list):
            data = [data]
        return iter([ContentItem.model_validate({**x, "source": x.get("source", path.name)}) for x in data])
    raise ValueError(f"Unsupported structured content extension: {ext}")


def parse_content_file(path: Path) -> list[ContentItem]:
    """Convenience helper for tests/small files. Large jobs use iter_content_file()."""
    return list(iter_content_file(path))
