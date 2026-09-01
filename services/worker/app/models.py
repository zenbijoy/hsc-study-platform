from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal
from pydantic import BaseModel, Field


ContentType = Literal["formula", "cq", "mcq", "note", "definition", "flashcard", "unknown"]
RightsStatus = Literal[
    "OWNED",
    "LICENSED",
    "OPEN_LICENSE",
    "PUBLIC_DOMAIN",
    "PUBLISHER_AUTHORIZED",
    "INTERNAL_ONLY",
    "UNVERIFIED",
]


class ContentItem(BaseModel):
    type: ContentType = "unknown"
    subject: str = "unknown"
    paper: int | None = None
    chapter: str = "unclassified"
    title: str | None = None
    latex: str | None = None
    question: str | None = None
    answer: str | None = None
    options: list[str] | None = None
    board: str | None = None
    year: int | None = None
    difficulty: int | None = Field(default=None, ge=1, le=5)
    importance: int | None = Field(default=None, ge=1, le=5)
    tags: list[str] = Field(default_factory=list)
    source: str | None = None
    confidence: float = Field(default=1.0, ge=0, le=1)
    fingerprint: str | None = None
    extra: dict[str, Any] = Field(default_factory=dict)

    def canonical_text(self) -> str:
        return self.question or self.latex or self.title or self.answer or ""


class ChapterCandidate(BaseModel):
    number: int
    title: str
    start_page: int
    end_page: int | None = None
    confidence: float = Field(default=0.95, ge=0, le=1)
    source: str = "pdf-outline"
    canonical_chapter_id: str | None = None


class PdfAnalysis(BaseModel):
    page_count: int
    title: str | None = None
    author: str | None = None
    publisher: str | None = None
    edition: str | None = None
    subject_hint: str | None = None
    paper_hint: int | None = None
    chapters: list[ChapterCandidate] = Field(default_factory=list)
    formula_candidates: list[ContentItem] = Field(default_factory=list)
    text_pages_indexed: int = 0
    text_ratio: float = 0.0
    is_scanned: bool = False
    language_hint: str = "bn"
    page_texts: dict[int, str] = Field(default_factory=dict)


class ImportJob(BaseModel):
    id: str
    source_name: str
    source_type: str
    source_path: str
    source_hash: str = ""
    status: str = "queued"
    stage: str = "upload"
    progress: float = 0
    total_items: int = 0
    processed_items: int = 0
    failed_items: int = 0
    detected_chapters: int = 0
    detected_formulas: int = 0
    detected_cqs: int = 0
    detected_mcqs: int = 0
    rights_status: RightsStatus = "UNVERIFIED"
    distribution_allowed: bool = False
    offline_download_allowed: bool = False
    subject_id: str | None = None
    paper_number: int | None = None
    message: str = "Queued"
    result: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class StorageObject(BaseModel):
    provider: str
    object_id: str
    name: str
    size: int
    delivery_url: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
