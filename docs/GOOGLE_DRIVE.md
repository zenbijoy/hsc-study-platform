# Google Drive 5 TB Integration & Warehouse Architecture

**Specification**: `docs/GOOGLE_DRIVE.md`  
**Purpose**: Private origin warehouse for large original PDFs, covers, search packs, and encrypted HSCP books.

---

## 1. Folder Structure

```text
HSC_CONTENT_FACTORY/
  00_INBOX/           (Upload sessions & temporary processing)
  10_ORIGINALS/       (Private raw PDF warehouse: bookId/original.pdf)
  20_SECURE_BOOKS/    (Encrypted HSCP packages: bookId/v1.hscp)
  30_CHAPTER_PACKS/   (Optional chapter packages)
  40_SEARCH_INDEXES/  (SQLite FTS5 search packs)
  50_COVERS/          (Generated cover thumbnails & previews)
  60_CONTENT_PACKS/   (Bulk question/formula SQLite packs)
  90_ARCHIVE/         (Archived versions & rollback history)
  99_FAILED/          (Failed job artifacts for debug retention)
```

---

## 2. Security & Credentials Boundary

- **Server-Side Only**: Drive credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, or Service Account keys) live strictly on the backend worker.
- **Zero Browser Exposure**: Admin uploads stream through resumable worker sessions (`/v1/uploads/pdf/session`), preventing any Google credentials from reaching the browser.
- **Zero Mobile Direct Access**: Mobile clients only receive device-bound licenses and download descriptors for encrypted `.hscp` packages.

---

## 3. Configuration & Resumable Streaming

```env
STORAGE_PROVIDER=drive # or 'local' for local development
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_DRIVE_FOLDER_ID=...
GOOGLE_DRIVE_PUBLIC_PACKAGES=false
UPLOAD_CHUNK_SIZE_MB=8
```
