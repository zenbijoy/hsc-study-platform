from __future__ import annotations

import re
from pathlib import Path
from typing import Any

import fitz  # PyMuPDF

from app.canonical_syllabus import (
    match_canonical_chapter,
    resolve_paper_alias,
    resolve_subject_alias,
    validate_chapter_boundaries,
)
from app.models import (
    ChapterCandidate,
    ContentItem,
    CoverCandidate,
    PdfAnalysis,
    ProvenanceSource,
)

CHAPTER_PATTERNS = [
    re.compile(r"^(?:chapter|ch\.)\s*([0-9ivx]+)\s*[:.\-–—]?\s*(.+)?$", re.I),
    re.compile(r"^(?:অধ্যায়|অধ্যায়)\s*[\-–—:]?\s*([০-৯0-9]+)\s*[\-–—:]?\s*(.*)$"),
    re.compile(r"^(?:পরিচ্ছেদ)\s*[\-–—:]?\s*([০-৯0-9]+)\s*[\-–—:]?\s*(.*)$"),
]

TOC_HEADER_PATTERN = re.compile(r"^(?:সূচিপত্র|contents|table of contents|সূচি)\b", re.I)
TOC_LINE_PATTERN = re.compile(r"^(.+?)[.\s\-_–—]{2,}\s*([০-৯0-9]+)$")
FORMULA_LINE = re.compile(r"^[A-Za-zα-ωΑ-ΩΔΣπρµ\s0-9_^{}()+\-*/.]+=[A-Za-zα-ωΑ-ΩΔΣπρµ\s0-9_^{}()+\-*/.=]+$")
EDITION_PATTERN = re.compile(r"\b(20[2-3][0-9]|(?:1st|2nd|3rd|[0-9]+th)\s*edition|সংস্করণ)\b", re.I)


def _detect_subject_and_paper(combined_text: str) -> tuple[str | None, int | None]:
    subject = resolve_subject_alias(combined_text)
    paper = resolve_paper_alias(combined_text)
    return subject, paper


def _from_outline(doc: fitz.Document, subject_id: str, paper: int) -> list[ChapterCandidate]:
    toc = doc.get_toc(simple=True)
    candidates: list[ChapterCandidate] = []
    top_levels = [row for row in toc if len(row) >= 3 and row[0] <= 2]
    for idx, (_, title, page, *_) in enumerate(top_levels, 1):
        if page <= 0:
            continue
        clean_title = str(title).strip()
        matched_canon, match_conf = match_canonical_chapter(clean_title, subject_id, paper)
        candidates.append(
            ChapterCandidate(
                number=idx,
                title=clean_title,
                start_page=int(page),
                confidence=0.99 if matched_canon else 0.90,
                source="pdf-outline",
                canonical_chapter_id=matched_canon.id if matched_canon else None,
            )
        )
    for i, item in enumerate(candidates):
        item.end_page = (candidates[i + 1].start_page - 1) if i + 1 < len(candidates) else doc.page_count
    return candidates


def _scan_printed_toc(doc: fitz.Document, subject_id: str, paper: int, max_pages: int = 25) -> list[ChapterCandidate]:
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
                            clean_title = title.strip()
                            matched_canon, _ = match_canonical_chapter(clean_title, subject_id, paper)
                            candidates.append(
                                ChapterCandidate(
                                    number=len(candidates) + 1,
                                    title=clean_title,
                                    start_page=page_num,
                                    confidence=0.92 if matched_canon else 0.85,
                                    source="printed-toc",
                                    canonical_chapter_id=matched_canon.id if matched_canon else None,
                                )
                            )
                    except ValueError:
                        pass
        if in_toc and candidates and len(lines) > 5 and not any(TOC_LINE_PATTERN.match(l) for l in lines[-3:]):
            break

    for i, item in enumerate(candidates):
        item.end_page = (candidates[i + 1].start_page - 1) if i + 1 < len(candidates) else doc.page_count
    return candidates


def _scan_headings(doc: fitz.Document, subject_id: str, paper: int, max_pages: int = 160) -> list[ChapterCandidate]:
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
        matched_canon, _ = match_canonical_chapter(title, subject_id, paper)
        out.append(
            ChapterCandidate(
                number=len(out) + 1,
                title=title,
                start_page=page,
                confidence=0.88 if matched_canon else 0.78,
                source="heading-regex",
                canonical_chapter_id=matched_canon.id if matched_canon else None,
            )
        )
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


def evaluate_cover_candidates(doc: fitz.Document, output_dir: Path | None = None, max_pages: int = 3) -> list[CoverCandidate]:
    """Renders and scores cover candidates across the first 3 pages."""
    candidates: list[CoverCandidate] = []
    if doc.page_count < 1:
        return candidates

    for idx in range(min(doc.page_count, max_pages)):
        page_num = idx + 1
        page = doc.load_page(idx)
        text = page.get_text("text") or ""
        images = page.get_images()

        # Score calculation
        score = 0.5
        reasons = []

        if idx == 0:
            score += 0.25
            reasons.append("First page bonus")

        if len(images) >= 1:
            score += 0.20
            reasons.append("Contains large image/cover artwork")

        char_count = len(text.strip())
        if char_count < 300:
            score += 0.15
            reasons.append("Concise cover-like typography")
        elif char_count > 1200:
            score -= 0.30
            reasons.append("Dense body text (unlikely cover)")

        # Subject or Title keyword bonus
        if any(w in text.lower() for w in ["hsc", "physics", "chemistry", "higher math", "biology", "ict", "পদার্থ", "রসায়ন", "গণিত"]):
            score += 0.10
            reasons.append("Contains textbook title/subject signals")

        score = max(0.1, min(1.0, score))
        preview_url = None

        if output_dir:
            output_dir.mkdir(parents=True, exist_ok=True)
            img_path = output_dir / f"cover_p{page_num}.png"
            rect = page.rect
            zoom = min(900 / max(rect.width, 1), 900 / max(rect.height, 1), 2.0)
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            pix.save(str(img_path))
            preview_url = str(img_path)

        candidates.append(
            CoverCandidate(
                page_number=page_num,
                score=round(score, 2),
                preview_url=preview_url,
                is_selected=False,
                reasons=reasons,
            )
        )

    # Select the candidate with highest score
    if candidates:
        best = max(candidates, key=lambda c: c.score)
        best.is_selected = True

    return candidates


def analyze_pdf(
    path: Path,
    cover_output_dir: Path | None = None,
    hints: dict[str, Any] | None = None,
) -> PdfAnalysis:
    hints = hints or {}
    doc = fitz.open(path)
    try:
        meta = doc.metadata or {}
        combined_text = f"{path.stem} {meta.get('title', '')} {meta.get('subject', '')}"

        # 1. Subject & Paper detection
        subject_hint = hints.get("suggested_subject") or _detect_subject_and_paper(combined_text)[0]
        paper_hint = hints.get("suggested_paper") or _detect_subject_and_paper(combined_text)[1]

        subject_prov: ProvenanceSource = "FOLDER_HINT" if hints.get("suggested_subject") else "CANONICAL_RULES"
        paper_prov: ProvenanceSource = "FOLDER_HINT" if hints.get("suggested_paper") else "CANONICAL_RULES"

        # 2. Formulas & text extraction
        formulas, indexed, ratio, page_texts = _formula_candidates(doc)

        # Refine hints from early page text if missing
        if not subject_hint or not paper_hint:
            sample_text = " ".join(page_texts.get(p, "") for p in range(1, min(6, doc.page_count + 1)))
            if not subject_hint:
                subject_hint = resolve_subject_alias(sample_text)
                if subject_hint:
                    subject_prov = "PDF_DATA"
            if not paper_hint:
                paper_hint = resolve_paper_alias(sample_text)
                if paper_hint:
                    paper_prov = "PDF_DATA"

        final_subject = subject_hint or "physics"
        final_paper = paper_hint or 1

        # 3. Chapter detection hierarchy (Outline ➔ Printed TOC ➔ Headings)
        chapters = _from_outline(doc, final_subject, final_paper)
        chapter_prov: ProvenanceSource = "PDF_DATA"
        if not chapters:
            chapters = _scan_printed_toc(doc, final_subject, final_paper)
            chapter_prov = "DETERMINISTIC_CLASSIFIER"
        if not chapters:
            chapters = _scan_headings(doc, final_subject, final_paper)
            chapter_prov = "DETERMINISTIC_CLASSIFIER"

        # Validate chapter boundaries
        _, chapter_warnings = validate_chapter_boundaries(chapters, doc.page_count)

        # 4. Multi-page Cover candidate evaluation
        cover_candidates = evaluate_cover_candidates(doc, cover_output_dir)

        # 5. Edition detection
        edition_match = EDITION_PATTERN.search(f"{path.stem} {meta.get('title', '')}")
        detected_edition = edition_match.group(0) if edition_match else None

        is_scanned = ratio < 0.20 or (indexed > 10 and len("".join(page_texts.values())) < 500)

        raw_title = hints.get("title") or meta.get("title") or path.stem.replace("_", " ").replace("-", " ")
        clean_title = re.sub(r"\s+", " ", str(raw_title)).strip()
        title_prov: ProvenanceSource = "MANIFEST_EXPLICIT" if hints.get("title") else ("PDF_DATA" if meta.get("title") else "FILENAME")

        confidence_scores = {
            "title": 0.95 if meta.get("title") else 0.85,
            "subject": 0.98 if subject_hint else 0.60,
            "paper": 0.95 if paper_hint else 0.60,
            "edition": 0.80 if detected_edition else 0.50,
            "publisher": 0.85 if meta.get("producer") else 0.60,
            "chapters": round(sum(c.confidence for c in chapters) / max(len(chapters), 1), 2) if chapters else 0.0,
        }

        provenance = {
            "title": title_prov,
            "subject": subject_prov,
            "paper": paper_prov,
            "chapters": chapter_prov,
            "publisher": "PDF_DATA" if meta.get("producer") else "CANONICAL_RULES",
        }

        return PdfAnalysis(
            page_count=doc.page_count,
            title=clean_title,
            author=meta.get("author") or None,
            publisher=meta.get("producer") or "NCTB Approved / HSC Platform",
            edition=detected_edition,
            subject_hint=final_subject,
            paper_hint=final_paper,
            chapters=chapters,
            formula_candidates=formulas,
            text_pages_indexed=indexed,
            text_ratio=ratio,
            is_scanned=is_scanned,
            page_texts=page_texts,
            cover_candidates=cover_candidates,
            confidence_scores=confidence_scores,
            provenance=provenance,
        )
    finally:
        doc.close()
