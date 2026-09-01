from __future__ import annotations

import difflib
import re
from typing import Any

from app.models import DuplicateEvaluation, DuplicateType


def normalize_title(title: str) -> str:
    cleaned = re.sub(r"[_.\-–—:,;()\[\]{}]+", " ", title)
    # Remove common year/edition suffixes e.g. "2026", "2027", "1st Edition", "Paper 1"
    cleaned = re.sub(r"\b(20[2-3][0-9]|edition|ed\.|version|v[0-9]+)\b", "", cleaned, flags=re.I)
    return " ".join(cleaned.lower().split())


def evaluate_duplicate(
    source_hash: str,
    title: str,
    subject_id: str,
    paper: int,
    publisher: str | None,
    edition: str | None,
    page_count: int,
    existing_books: list[dict[str, Any]],
) -> DuplicateEvaluation:
    """Evaluates whether an incoming PDF is an exact duplicate, same book, or a new version."""
    # 1. Level 1: Exact File Duplicate (matching SHA-256)
    for b in existing_books:
        if b.get("source_hash") and b.get("source_hash") == source_hash:
            return DuplicateEvaluation(
                duplicate_type="EXACT_FILE_DUPLICATE",
                existing_book_id=b.get("id"),
                existing_version_id=b.get("published_version_id") or b.get("book_version_id"),
                existing_book_title=b.get("title"),
                confidence=1.0,
                reason=f"Exact SHA-256 hash match with existing book '{b.get('title')}'",
            )

    norm_incoming_title = normalize_title(title)
    incoming_edition = str(edition or "").strip()

    # 2. Level 2 & 3: Fuzzy Book Matching & New Version Detection
    for b in existing_books:
        existing_title = b.get("title", "")
        norm_existing = normalize_title(existing_title)
        existing_subject = b.get("subject_id")
        existing_paper = b.get("paper")

        if existing_subject != subject_id or existing_paper != paper:
            continue

        title_sim = difflib.SequenceMatcher(None, norm_incoming_title, norm_existing).ratio()
        if title_sim >= 0.82:
            existing_edition = str(b.get("edition") or "").strip()
            existing_pages = int(b.get("page_count") or 0)

            # Check if edition differs or year in title differs -> New Version
            is_different_edition = bool(incoming_edition and existing_edition and incoming_edition != existing_edition)
            page_diff = abs(page_count - existing_pages)

            if is_different_edition or (page_diff > 2 and title_sim >= 0.88):
                return DuplicateEvaluation(
                    duplicate_type="POSSIBLE_NEW_VERSION",
                    existing_book_id=b.get("id"),
                    existing_version_id=b.get("published_version_id") or b.get("book_version_id"),
                    existing_book_title=existing_title,
                    confidence=round(title_sim, 2),
                    reason=f"Matches title '{existing_title}' (similarity {int(title_sim*100)}%) with different edition/pages ({incoming_edition or page_count} vs {existing_edition or existing_pages})",
                )

            if title_sim >= 0.90:
                return DuplicateEvaluation(
                    duplicate_type="LIKELY_SAME_BOOK",
                    existing_book_id=b.get("id"),
                    existing_version_id=b.get("published_version_id") or b.get("book_version_id"),
                    existing_book_title=existing_title,
                    confidence=round(title_sim, 2),
                    reason=f"High similarity match ({int(title_sim*100)}%) with existing book '{existing_title}'",
                )

    return DuplicateEvaluation(duplicate_type="NONE", confidence=0.0, reason="No duplicate found")
