# Content Factory Worker Audit

**Runtime**: Python 3.12+ · FastAPI · PyMuPDF (fitz) · Cryptography · RapidFuzz · Zstandard · SQLite · Boto3 · Google API Client

---

## 1. Module Inventory & Responsibilities

| Module | File | Responsibility |
| :--- | :--- | :--- |
| **HTTP API** | `services/worker/app/api.py` | FastAPI REST endpoints (`/health`, `/v1/imports/upload`, `/v1/imports/text`, `/v1/imports/{id}`, `/v1/imports/{id}/publish`, `/v1/content/{path}`). Background thread worker loop pool. |
| **Pipeline Coordinator** | `services/worker/app/pipeline.py` | Full multi-stage ingestion orchestrator: Fingerprint → PDF Analysis → TOC/Chapter Candidate Detection → Streaming Staging → Deduplication → Content Packs → Search Index → HSCP Encryption → Catalog Upsert → Review Preparation → Atomic Publish. |
| **PDF Analyzer** | `services/worker/app/pdf_analyzer.py` | PyMuPDF-based PDF extraction: Reads document metadata, extracts Table of Contents (TOC) bookmarks, detects chapter title headings, determines page bounds (`start_page`, `end_page`), measures text-to-page density ratio, and scans for inline formula candidates. |
| **Multi-Format Parsers** | `services/worker/app/parsers.py` | Streaming generators for `.jsonl`, `.ndjson`, `.txt`, `.md`, and `.csv`. Normalizes formulas, CQs, and MCQs into unified `ContentItem` models. |
| **Deduplication Engine** | `services/worker/app/dedupe.py` | SHA-256 fingerprinting for exact deduplication; RapidFuzz string similarity comparison for near-duplicate question detection. |
| **HSCP Crypto Packager** | `services/worker/app/hscp.py` | Binary container builder: splits source into 4 MB chunks, computes per-chunk SHA-256, encrypts chunks with random 12-byte nonces and AES-256-GCM, prepends `HSCP0001` container header. Wraps content keys using server master key (`CONTENT_MASTER_KEY_B64`). |
| **Storage Abstraction** | `services/worker/app/storage.py` | Unified storage provider interface with 3 concrete drivers: `LocalStorageProvider` (local disk warehouse), `GoogleDriveStorageProvider` (5 TB Drive warehouse via OAuth/Refresh Token), and `CloudflareR2StorageProvider` (S3-compatible CDN hot-cache). |
| **Disk-Backed Staging** | `services/worker/app/staging.py` | SQLite disk-backed streaming staging store. Handles million-record ingestion without loading full datasets into server RAM or spamming Postgres. |
| **Content Pack Builder** | `services/worker/app/packs.py` | Bundles categorized items into compressed content packs (`.jsonl.zst` / `.jsonl`) partitioned by subject, chapter, and item type. |
| **Full-Text Search Indexer**| `services/worker/app/search_index.py`| Builds portable SQLite databases with FTS5 virtual tables (`content_fts`) for offline instant client search. |
| **Catalog Publisher** | `services/worker/app/catalog.py` | Server-side publisher supporting both `SupabaseCatalog` (writes to Supabase tables using service-role key) and `LocalCatalog` (JSON-backed local fallback for zero-cloud demo mode). |
| **Job Store** | `services/worker/app/job_store.py` | SQLite persistent queue & job store (`jobs.db`) storing `ImportJob` state, stage, progress, and results across server restarts. |
| **Data Models** | `services/worker/app/models.py` | Pydantic data schemas: `ContentItem`, `ImportJob`, `ChapterCandidate`, `PdfAnalysisResult`, `StorageObject`. |
| **Configuration** | `services/worker/app/config.py` | Pydantic Settings reading environment variables (`STORAGE_PROVIDER`, `SUPABASE_URL`, `CONTENT_MASTER_KEY_B64`, `GOOGLE_CLIENT_ID`, etc.). |
| **OCR Extension Point** | `services/worker/app/ocr.py` | Pluggable OCR interface stub for scanned Bengali textbook processing. |

---

## 2. Ingestion Pipeline & State Machine

```text
UPLOAD / STAGE
      ↓
QUICK_SCAN (SHA-256 Fingerprinting)
      ↓
STRUCTURE (TOC & Chapter Candidate Analysis via PyMuPDF)
      ↓
ORIGIN_UPLOAD (Private Google Drive / Local Warehouse)
      ↓
EXTRACT (Streaming structured content into Staging SQLite)
      ↓
DEDUPE & CONFIDENCE (Exact & fuzzy duplicate elimination)
      ↓
PACK (Build compressed content packs & SQLite FTS5 index)
      ↓
HSCP_ENCRYPTION (AES-256-GCM chunked package creation)
      ↓
READY_FOR_REVIEW (Confidence review summary & rights verification)
      ↓
ATOMIC_PUBLISH (Supabase published_version_id pointer switch)
```

---

## 3. Large File Resilience & Idempotency
1. **Idempotency**: Every import computes `source_hash` (SHA-256 of the input file). Duplicate uploads are recognized immediately.
2. **Million-Record Protection**: The worker stages large datasets on local disk via SQLite (`staging.sqlite`), preventing memory exhaustion.
3. **No PostgreSQL Blobs**: Original and encrypted objects are transferred directly to Drive/R2/local warehouse. Postgres receives only lightweight version rows and chapter boundary records.
