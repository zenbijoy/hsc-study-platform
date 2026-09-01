from __future__ import annotations

import re
from pathlib import Path
import fitz  # PyMuPDF
from app.models import ChapterCandidate, ContentItem, PdfAnalysis

CHAPTER_PATTERNS = [
    re.compile(r"^(?:chapter|ch\.)\s*([0-9ivx]+)\s*[:.\-–—]?\s*(.+)?$", re.I),
    re.compile(r"^(?:অধ্যায়|অধ্যায়)\s*[\-–—:]?\s*([০-৯0-9]+)\s*[\-–—:]?\s*(.*)$"),
]

FORMULA_LINE = re.compile(r"^[A-Za-zα-ωΑ-ΩΔΣπρµ\s0-9_^{}()+\-*/.]+=[A-Za-zα-ωΑ-ΩΔΣπρµ\s0-9_^{}()+\-*/.=]+$")


def _from_outline(doc: fitz.Document) -> list[ChapterCandidate]:
    toc = doc.get_toc(simple=True)
    candidates: list[ChapterCandidate] = []
    top_levels = [row for row in toc if len(row) >= 3 and row[0] <= 2]
    for idx, (_, title, page, *_) in enumerate(top_levels, 1):
        if page <= 0:
            continue
        candidates.append(ChapterCandidate(number=idx, title=str(title).strip(), start_page=int(page), confidence=0.99, source="pdf-outline"))
    for i, item in enumerate(candidates):
        item.end_page = (candidates[i + 1].start_page - 1) if i + 1 < len(candidates) else doc.page_count
    return candidates


def _scan_headings(doc: fitz.Document, max_pages: int = 160) -> list[ChapterCandidate]:
    found: list[tuple[int, str]] = []
    for page_idx in range(min(doc.page_count, max_pages)):
        text = doc.load_page(page_idx).get_text("text") or ""
        for raw in text.splitlines()[:80]:
            line = " ".join(raw.split())
            if not (3 <= len(line) <= 120):
                continue
            if any(p.match(line) for p in CHAPTER_PATTERNS):
                found.append((page_idx + 1, line))
                break
    out: list[ChapterCandidate] = []
    seen_pages: set[int] = set()
    for page, title in found:
        if page in seen_pages:
            continue
        seen_pages.add(page)
        out.append(ChapterCandidate(number=len(out) + 1, title=title, start_page=page, confidence=0.78, source="heading-regex"))
    for i, item in enumerate(out):
        item.end_page = (out[i + 1].start_page - 1) if i + 1 < len(out) else doc.page_count
    return out


def _formula_candidates(doc: fitz.Document, max_pages: int = 200, max_items: int = 500) -> tuple[list[ContentItem], int, float]:
    items: list[ContentItem] = []
    pages_with_text = 0
    total_chars = 0
    pages = min(doc.page_count, max_pages)
    for page_idx in range(pages):
        text = doc.load_page(page_idx).get_text("text") or ""
        if text.strip():
            pages_with_text += 1
            total_chars += len(text)
        for raw in text.splitlines():
            line = " ".join(raw.split())
            if 3 <= len(line) <= 90 and "=" in line and FORMULA_LINE.match(line):
                items.append(ContentItem(type="formula", title="Extracted formula candidate", latex=line, chapter="unclassified", confidence=0.58, source=f"pdf:p{page_idx+1}", extra={"page": page_idx+1}))
                if len(items) >= max_items:
                    break
        if len(items) >= max_items:
            break
    ratio = pages_with_text / max(pages, 1)
    return items, pages, ratio


def analyze_pdf(path: Path) -> PdfAnalysis:
    doc = fitz.open(path)
    try:
        meta = doc.metadata or {}
        chapters = _from_outline(doc)
        if not chapters:
            chapters = _scan_headings(doc)
        formulas, indexed, ratio = _formula_candidates(doc)
        return PdfAnalysis(
            page_count=doc.page_count,
            title=meta.get("title") or path.stem,
            author=meta.get("author") or None,
            chapters=chapters,
            formula_candidates=formulas,
            text_pages_indexed=indexed,
            text_ratio=ratio,
        )
    finally:
        doc.close()
