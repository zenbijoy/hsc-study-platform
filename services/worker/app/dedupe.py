from __future__ import annotations

from app.models import ContentItem
from app.utils import fingerprint


def attach_fingerprint(item: ContentItem) -> ContentItem:
    item.fingerprint = fingerprint([
        item.type,
        item.subject,
        str(item.paper or ""),
        item.chapter,
        item.canonical_text(),
    ])
    return item


def deduplicate(items: list[ContentItem]) -> tuple[list[ContentItem], int]:
    out: list[ContentItem] = []
    seen: set[str] = set()
    duplicates = 0
    for item in items:
        attach_fingerprint(item)
        assert item.fingerprint is not None
        if item.fingerprint in seen:
            duplicates += 1
            continue
        seen.add(item.fingerprint)
        out.append(item)
    return out, duplicates
