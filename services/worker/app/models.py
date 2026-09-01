from __future__ import annotations

import uuid
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
ImportSourceType = Literal["browser_upload", "local_file", "local_folder", "drive_inbox", "cli", "api"]
JobPriority = Literal["HIGH", "NORMAL", "LOW"]
ProcessingProfile = Literal["FAST", "STANDARD", "DEEP"]
ProvenanceSource = Literal[
    "ADMIN_OVERRIDE",
    "MANIFEST_EXPLICIT",
    "VERIFIED_MATCH",
    "CANONICAL_RULES",
    "PDF_DATA",
    "DETERMINISTIC_CLASSIFIER",
    "AI",
    "FOLDER_HINT",
    "FILENAME",
    "UNKNOWN",
]
DuplicateType = Literal["NONE", "EXACT_FILE_DUPLICATE", "LIKELY_SAME_BOOK", "POSSIBLE_NEW_VERSION"]

BookStatus = Literal["DRAFT", "ACTIVE", "UNPUBLISHED", "ARCHIVED"]
BookVersionStatus = Literal["PROCESSING", "REVIEW_REQUIRED", "READY", "ACTIVE", "INACTIVE", "FAILED"]
ArtifactStatus = Literal["READY", "PROCESSING", "FAILED", "STALE", "UNAVAILABLE", "CORRUPTED"]
SectionType = Literal["FRONT_MATTER", "CHAPTER", "APPENDIX", "INDEX", "REFERENCE", "OTHER"]
AccessMode = Literal["ALL_AUTHENTICATED", "ENTITLEMENT_REQUIRED", "PRIVATE_TEST", "RESTRICTED_GROUP"]
IssueCategory = Literal[
    "WRONG_CHAPTER",
    "WRONG_PAGE",
    "WRONG_COVER",
    "WRONG_METADATA",
    "READER_ERROR",
    "SEARCH_ERROR",
    "FORMULA_LINK_ERROR",
    "CQ_LINK_ERROR",
    "COPYRIGHT_ISSUE",
    "OTHER",
]
IssueStatus = Literal["OPEN", "INVESTIGATING", "FIXED", "REJECTED", "DUPLICATE"]
AuditAction = Literal[
    "BOOK_CREATED",
    "METADATA_CHANGED",
    "COVER_CHANGED",
    "CHAPTER_MAP_CHANGED",
    "RIGHTS_CHANGED",
    "VERSION_UPLOADED",
    "VERSION_PUBLISHED",
    "VERSION_ROLLBACK",
    "UNPUBLISH",
    "ARCHIVE",
    "SEARCH_REBUILT",
    "HSCP_REBUILT",
    "RELATIONSHIPS_CHANGED",
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
    manual_override: bool = False
    section_type: SectionType = "CHAPTER"


class CoverCandidate(BaseModel):
    page_number: int
    score: float = Field(default=0.5, ge=0, le=1)
    preview_url: str | None = None
    is_selected: bool = False
    reasons: list[str] = Field(default_factory=list)


class FieldProvenance(BaseModel):
    value: Any = None
    source: ProvenanceSource = "UNKNOWN"
    confidence: float = Field(default=0.5, ge=0, le=1)
    locked_by_admin: bool = False


class CanonicalChapter(BaseModel):
    id: str
    subject_id: str
    paper: int
    chapter_number: int
    title_bn: str
    title_en: str
    aliases: list[str] = Field(default_factory=list)


class DuplicateEvaluation(BaseModel):
    duplicate_type: DuplicateType = "NONE"
    existing_book_id: str | None = None
    existing_version_id: str | None = None
    existing_book_title: str | None = None
    confidence: float = Field(default=0.0, ge=0, le=1)
    reason: str = "No duplicate detected"


class ImportFileDescriptor(BaseModel):
    source_type: ImportSourceType = "browser_upload"
    original_filename: str
    size: int
    mime_type: str = "application/pdf"
    storage_ref: str | None = None
    source_path: str
    source_hash: str = ""
    discovered_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    rights_metadata: dict[str, Any] = Field(default_factory=dict)
    hints: dict[str, Any] = Field(default_factory=dict)
    import_group_id: str | None = None


class DiscoveryCandidate(BaseModel):
    source_type: ImportSourceType
    source_path: str
    filename: str
    size: int
    modified_time: str | None = None
    drive_file_id: str | None = None
    hints: dict[str, Any] = Field(default_factory=dict)
    status: str = "discovered"
    source_hash: str | None = None


class DiscoverySummary(BaseModel):
    source_type: ImportSourceType
    new_files: int = 0
    already_imported: int = 0
    changed_files: int = 0
    unsupported: int = 0
    candidates: list[DiscoveryCandidate] = Field(default_factory=list)


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
    cover_candidates: list[CoverCandidate] = Field(default_factory=list)
    confidence_scores: dict[str, float] = Field(default_factory=dict)
    provenance: dict[str, ProvenanceSource] = Field(default_factory=dict)


class ImportJob(BaseModel):
    id: str
    source_name: str
    source_type: str
    source_path: str
    source_hash: str = ""
    status: str = "queued"
    stage: str = "upload"
    priority: JobPriority = "NORMAL"
    profile: ProcessingProfile = "STANDARD"
    import_group_id: str | None = None
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
    detected_title: str | None = None
    detected_publisher: str | None = None
    detected_edition: str | None = None
    message: str = "Queued"
    confidence_scores: dict[str, float] = Field(default_factory=dict)
    provenance: dict[str, ProvenanceSource] = Field(default_factory=dict)
    cover_candidates: list[CoverCandidate] = Field(default_factory=list)
    selected_cover_page: int = 1
    duplicate_info: DuplicateEvaluation = Field(default_factory=DuplicateEvaluation)
    checkpoints: dict[str, Any] = Field(default_factory=dict)
    blocking_issues: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    lease_worker_id: str | None = None
    lease_expires_at: str | None = None
    heartbeat_at: str | None = None
    result: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ImportGroup(BaseModel):
    id: str
    name: str
    source_type: ImportSourceType
    status: str = "active"
    total_files: int = 0
    processed_files: int = 0
    published_files: int = 0
    failed_files: int = 0
    created_by: str | None = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class StorageObject(BaseModel):
    provider: str
    object_id: str
    name: str
    size: int
    delivery_url: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


# --- Phase 16 CMS Domain Models ---

class BookVersion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    book_id: str
    version: int = 1
    edition_label: str | None = None
    page_count: int = 0
    package_sha256: str | None = None
    storage_provider: str = "local"
    original_object_id: str | None = None
    secure_object_id: str | None = None
    delivery_url: str | None = None
    original_metadata: dict[str, Any] = Field(default_factory=dict)
    secure_metadata: dict[str, Any] = Field(default_factory=dict)
    status: BookVersionStatus = "READY"
    is_active: bool = False
    search_status: ArtifactStatus = "READY"
    hscp_status: ArtifactStatus = "READY"
    search_pack_id: str | None = None
    search_indexed_pages: int = 0
    search_schema_version: str = "1.0.0"
    text_ratio: float = 0.0
    is_scanned: bool = False
    cover_candidates: list[CoverCandidate] = Field(default_factory=list)
    selected_cover_page: int = 1
    chapter_map_revision: int = 1
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BookChapterRevision(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    book_id: str
    book_version_id: str
    revision_number: int = 1
    chapters: list[ChapterCandidate] = Field(default_factory=list)
    source: str = "AUTO_DETECTION"
    status: str = "ACTIVE"
    created_by: str | None = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ContentIssue(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    book_id: str
    book_version_id: str | None = None
    page_number: int | None = None
    category: IssueCategory = "OTHER"
    priority: str = "NORMAL"
    status: IssueStatus = "OPEN"
    message: str
    reporter_email: str | None = None
    reporter_user_id: str | None = None
    resolution_notes: str | None = None
    resolved_at: str | None = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BookAuditEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    book_id: str
    book_version_id: str | None = None
    action: AuditAction
    actor_email: str = "admin@hscstudy.internal"
    actor_id: str | None = None
    before_state: dict[str, Any] = Field(default_factory=dict)
    after_state: dict[str, Any] = Field(default_factory=dict)
    reason: str | None = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BookRelationship(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    book_id: str
    book_version_id: str
    entity_type: Literal["formula", "cq", "mcq", "concept"] = "formula"
    entity_id: str
    page_number: int
    chapter_number: int | None = None
    relationship_type: str = "DIRECT_REFERENCE"
    status: str = "ACTIVE"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class Book(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: str | None = None
    subject_id: str = "physics"
    paper: int = 1
    publisher: str | None = "NCTB Approved"
    edition: str | None = None
    status: BookStatus = "DRAFT"
    access_mode: AccessMode = "ALL_AUTHENTICATED"
    is_protected: bool = True
    is_published: bool = False
    published_version_id: str | None = None
    active_version_id: str | None = None
    chapter_count: int = 0
    formula_count: int = 0
    cq_count: int = 0
    mcq_count: int = 0
    page_count: int = 0
    cover_url: str | None = None
    cover_thumbnail_url: str | None = None
    source_hash: str | None = None
    rights_status: RightsStatus = "UNVERIFIED"
    distribution_allowed: bool = False
    online_reading_allowed: bool = True
    offline_download_allowed: bool = False
    classification_confidence: dict[str, float] = Field(default_factory=dict)
    classification_provenance: dict[str, str] = Field(default_factory=dict)
    metadata_locked_by_admin: bool = False
    chapters_locked_by_admin: bool = False
    tags: list[str] = Field(default_factory=list)
    academic_year: str | None = None
    description: str | None = None
    authors: list[str] = Field(default_factory=list)
    import_group_id: str | None = None
    first_published_at: str | None = None
    current_version_published_at: str | None = None
    featured: bool = False
    sort_order: int = 0
    version_token: int = 1
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class QualitySummary(BaseModel):
    total_books: int = 0
    published_books: int = 0
    draft_books: int = 0
    missing_covers: int = 0
    missing_chapters: int = 0
    broken_packages: int = 0
    search_failures: int = 0
    rights_unverified: int = 0
    broken_formula_links: int = 0
    broken_cq_links: int = 0
    open_reports: int = 0


class BookValidationResult(BaseModel):
    book_id: str
    can_publish: bool
    blocking_issues: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    health: dict[str, str] = Field(default_factory=dict)


class VersionDiffResult(BaseModel):
    version_a: int
    version_b: int
    metadata_diff: dict[str, Any] = Field(default_factory=dict)
    chapter_diff: dict[str, Any] = Field(default_factory=dict)
    page_diff: int = 0
    package_diff: dict[str, Any] = Field(default_factory=dict)
