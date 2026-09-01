from __future__ import annotations

import re
from pathlib import Path
import fitz  # PyMuPDF
from app.models import ChapterCandidate, ContentItem, PdfAnalysis

CHAPTER_PATTERNS = [
    re.compile(r"^(?:chapter|ch\.)\s*([0-9ivx]+)\s*[:.\-–—]?\s*(.+)?$", re.I),
    re.compile(r"^(?:অধ্যায়|অধ্যায়)\s*[\-–—:]?\s*([০-৯0-9]+)\s*[\-–—:]?\s*(.*)$"),
    re.compile(r"^(?:পরিচ্ছেদ)\s*[\-–—:]?\s*([০-৯0-9]+)\s*[\-–—:]?\s*(.*)$"),
]

TOC_HEADER_PATTERN = re.compile(r"^(?:সূচিপত্র|contents|table of contents|সূচি)\b", re.I)
TOC_LINE_PATTERN = re.compile(r"^(.+?)[.\s\-_–—]{2,}\s*([০-৯0-9]+)$")

SUBJECT_PATTERNS = {
    "physics": re.compile(r"\b(?:physics|পদার্থবিজ্ঞান|পদার্থ)\b", re.I),
    "chemistry": re.compile(r"\b(?:chemistry|রসায়ন|রসায়ন)\b", re.I),
    "mathematics": re.compile(r"\b(?:math|mathematics|উচ্চতর গণিত|গণিত)\b", re.I),
    "biology": re.compile(r"\b(?:biology|জীববিজ্ঞান|জীব)\b", re.I),
    "ict": re.compile(r"\b(?:ict|তথ্য ও যোগাযোগ প্রযুক্তি)\b", re.I),
}

PAPER_1_PATTERN = re.compile(r"\b(?:1st|first|১ম|প্রথম|paper\s*1)\b", re.I)
PAPER_2_PATTERN = re.compile(r"\b(?:2nd|second|২য়|২য়|দ্বিতীয়|দ্বিতীয়|paper\s*2)\b", re.I)

FORMULA_LINE = re.compile(r"^[A-Za-zα-ωΑ-ΩΔΣπρµ\s0-9_^{}()+\-*/.]+=[A-Za-zα-ωΑ-ΩΔΣπρµ\s0-9_^{}()+\-*/.=]+$")


def _detect_subject(text: str) -> str | None:
    normalized = re.sub(r"[_.\-–—]+", " ", text)
    for subject_id, pattern in SUBJECT_PATTERNS.items():
        if pattern.search(normalized):
            return subject_id
    return None


def _detect_paper(text: str) -> int | None:
    normalized = re.sub(r"[_.\-–—]+", " ", text)
    if PAPER_2_PATTERN.search(normalized):
        return 2
    if PAPER_1_PATTERN.search(normalized):
        return 1
    return None


def _from_outline(doc: fitz.Document) -> list[ChapterCandidate]:
    toc = doc.get_toc(simple=True)
    candidates: list[ChapterCandidate] = []
    top_levels = [row for row in toc if len(row) >= 3 and row[0] <= 2]
    for idx, (_, title, page, *_) in enumerate(top_levels, 1):
        if page <= 0:
            continue
        candidates.append(
            ChapterCandidate(
                number=idx,
                title=str(title).strip(),
                start_page=int(page),
                confidence=0.99,
                source="pdf-outline",
            )
        )
    for i, item in enumerate(candidates):
        item.end_page = (candidates[i + 1].start_page - 1) if i + 1 < len(candidates) else doc.page_count
    return candidates


def _scan_printed_toc(doc: fitz.Document, max_pages: int = 15) -> list[ChapterCandidate]:
    candidates: list[ChapterCandidate] = []
    in_toc = False
    for page_idx in range(min(doc.page_count, max_pages)):
        text = doc.load_page(page_idx).get_text("text") or ""
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        for line in lines:
            if TOC_HEADER_PATTERN.search(line):
                in_toc = True
                continue
            if in_toc:
                match = TOC_LINE_PATTERN.match(line)
                if match:
                    title, raw_page = match.groups()
                    try:
                        # Normalize bangla digits to ascii
                        ascii_digits = raw_page.translate(str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789"))
                        page_num = int(ascii_digits)
                        if 1 <= page_num <= doc.page_count:
                            candidates.append(
                                ChapterCandidate(
                                    number=len(candidates) + 1,
                                    title=title.strip(),
                                    start_page=page_num,
                                    confidence=0.92,
                                    source="printed-toc",
                                )
                            )
                    except ValueError:
                        pass
        if in_toc and candidates and len(lines) > 5 and not any(TOC_LINE_PATTERN.match(l) for l in lines[-3:]):
            break

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


def _formula_candidates(doc: fitz.Document, max_pages: int = 200, max_items: int = 500) -> tuple[list[ContentItem], int, float, dict[int, str]]:
    items: list[ContentItem] = []
    pages_with_text = 0
    pages = min(doc.page_count, max_pages)
    page_texts: dict[int, str] = {}

    for page_idx in range(pages):
        text = doc.load_page(page_idx).get_text("text") or ""
        page_texts[page_idx + 1] = text
        if text.strip():
            pages_with_text += 1
        for raw in text.splitlines():
            line = " ".join(raw.split())
            if 3 <= len(line) <= 90 and "=" in line and FORMULA_LINE.match(line):
                items.append(
                    ContentItem(
                        type="formula",
                        title="Extracted formula candidate",
                        latex=line,
                        chapter="unclassified",
                        confidence=0.58,
                        source=f"pdf:p{page_idx+1}",
                        extra={"page": page_idx + 1},
                    )
                )
                if len(items) >= max_items:
                    break

    ratio = pages_with_text / max(pages, 1)
    return items, pages, ratio, page_texts


def extract_cover_image(doc: fitz.Document, output_path: Path, max_dimension: int = 900) -> Path | None:
    if doc.page_count < 1:
        return None
    page = doc.load_page(0)
    rect = page.rect
    zoom = min(max_dimension / max(rect.width, 1), max_dimension / max(rect.height, 1), 2.0)
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    pix.save(str(output_path))
    return output_path


def analyze_pdf(path: Path, cover_output_path: Path | None = None) -> PdfAnalysis:
    doc = fitz.open(path)
    try:
        meta = doc.metadata or {}
        combined_text = f"{path.stem} {meta.get('title', '')} {meta.get('subject', '')}"

        # 1. Subject & Paper detection
        subject_hint = _detect_subject(combined_text)
        paper_hint = _detect_paper(combined_text)

        # 2. Chapter detection hierarchy (Outline ➔ Printed TOC ➔ Headings)
        chapters = _from_outline(doc)
        if not chapters:
            chapters = _scan_printed_toc(doc)
        if not chapters:
            chapters = _scan_headings(doc)

        # 3. Formulas & text extraction
        formulas, indexed, ratio, page_texts = _formula_candidates(doc)

        # If early pages contain subject/paper signals, refine hints
        if not subject_hint or not paper_hint:
            sample_text = " ".join(page_texts.get(p, "") for p in range(1, min(6, doc.page_count + 1)))
            if not subject_hint:
                subject_hint = _detect_subject(sample_text)
            if not paper_hint:
                paper_hint = _detect_paper(sample_text)

        # 4. Cover extraction
        if cover_output_path:
            extract_cover_image(doc, cover_output_path)

        is_scanned = ratio < 0.20 or (indexed > 10 and len("".join(page_texts.values())) < 500)

        clean_title = meta.get("title") or path.stem.replace("_", " ").replace("-", " ")
        clean_title = re.sub(r"\s+", " ", clean_title).strip()

        return PdfAnalysis(
            page_count=doc.page_count,
            title=clean_title,
            author=meta.get("author") or None,
            publisher=meta.get("producer") or "NCTB Approved / HSC Platform",
            subject_hint=subject_hint or "physics",
            paper_hint=paper_hint or 1,
            chapters=chapters,
            formula_candidates=formulas,
            text_pages_indexed=indexed,
            text_ratio=ratio,
            is_scanned=is_scanned,
            page_texts=page_texts,
        )
    finally:
        doc.close()
