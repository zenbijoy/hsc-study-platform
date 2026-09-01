from __future__ import annotations

import base64
import hashlib
import json
import re
import unicodedata
from pathlib import Path
from typing import Iterable, Iterator, TypeVar

T = TypeVar("T")


def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        while chunk := f.read(chunk_size):
            h.update(chunk)
    return h.hexdigest()


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value or "")
    value = value.replace("\u200b", " ").replace("\ufeff", " ")
    value = value.lower().strip()
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"[“”‘’]", '"', value)
    return value


def fingerprint(parts: Iterable[str]) -> str:
    material = "\x1f".join(normalize_text(x) for x in parts)
    return hashlib.sha256(material.encode("utf-8")).hexdigest()


def b64e(data: bytes) -> str:
    return base64.b64encode(data).decode("ascii")


def b64d(value: str) -> bytes:
    return base64.b64decode(value.encode("ascii"))


def json_dumps(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def chunks(iterable: list[T], size: int) -> Iterator[list[T]]:
    for i in range(0, len(iterable), size):
        yield iterable[i : i + size]
