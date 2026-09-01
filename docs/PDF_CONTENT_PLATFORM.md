# Universal PDF Content Platform & Ingestion Architecture

**Specification**: `docs/PDF_CONTENT_PLATFORM.md`  
**Applies To**: `apps/admin`, `services/worker`, `apps/mobile`, `supabase`  
**Purpose**: Complete reference architecture for PDF upload, processing, encrypted packaging, rights verification, and mobile reading.

---

## 1. System Overview

```text
[Admin Upload Studio] 
        │ (Resumable 8MB chunked upload)
        ▼
[FastAPI / Content Factory] ➔ [Private Google Drive Warehouse: 10_ORIGINALS/]
        │
        ▼
[PyMuPDF Structure Analyzer] ➔ (Title, Subject, Paper, Outline, TOC, Headings, Cover)
        │
        ▼
[HSCP Encrypted Packaging] ➔ (AES-256-GCM, Content Key wrapped in Server Master Key)
        │
        ▼
[SQLite FTS5 Search Pack] ➔ (Search index pack)
        │
        ▼
[Admin Review & Rights Check] ➔ (Verified rights required: LICENSED, OPEN_LICENSE, etc.)
        │
        ▼
[Atomic Publishing] ➔ (Updates active version pointer in Supabase `books.published_version_id`)
        │
        ▼
[Student Mobile App] ➔ (Catalog refresh ➔ Book Details ➔ Secure Reader ➔ Offline HSCP)
```

---

## 2. Storage Separation Invariant

1. **Google Drive / Warehouse**: Stores large original PDFs (`10_ORIGINALS/`), encrypted `.hscp` packages (`20_SECURE_BOOKS/`), and covers (`50_COVERS/`).
2. **Supabase**: Stores lightweight metadata, relationships, active version pointers, rights records, and reading progress. Zero PDF binaries in Postgres.
3. **Python Worker**: Executes heavy PyMuPDF extraction, cover rendering, OCR fallback, and AES-256-GCM chunk encryption.
4. **Mobile Client**: Renders books via Secure Reader sandbox, enforcing hardware screenshot protection and AES-256-GCM decryption in temporary private memory.
