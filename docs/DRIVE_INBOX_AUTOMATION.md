# Google Drive Inbox Automation Specification

## 1. Folder Structure & Storage Layout

The canonical Google Drive storage hierarchy is structured as follows:

```text
Google Drive Root /
├── 00_INBOX/                   <-- Upload folder for editorial PDF drops
│   ├── Physics/
│   │   ├── Paper1/
│   │   └── Paper2/
│   └── Chemistry/
├── 10_ORIGINALS/               <-- Unaltered raw PDF warehouse (Private)
│   └── <book_id>/
│       └── source.pdf
├── 20_SECURE_BOOKS/            <-- Stream-encrypted HSCP AES-256-GCM containers
│   └── <book_id>/
│       └── v1.hscp
├── 30_CONTENT_PACKS/           <-- Compressed JSONL / formula bundles
├── 40_SEARCH_INDEXES/          <-- SQLite FTS5 full-text search indexes
└── 50_COVERS/                  <-- Extracted high-res cover art PNGs (Public)
    └── <book_id>/
        └── cover.png
```

---

## 2. Ingestion Lifecycle & State Machine

1. **Discovery**: Worker queries `00_INBOX` using `GoogleDriveInboxDiscovery` with page tokens.
2. **Metadata Evaluation**: Filename, size, modified time, and MD5 checksum are logged into `drive_inbox_items` with status `discovered`.
3. **Queueing**: Operator or automated cron enqueues items into `import_jobs`.
4. **Processing**:
   - Downloads source PDF from `00_INBOX`.
   - Generates SHA-256 and evaluates deduplication.
   - Fast-pass PyMuPDF outline & canonical chapter matching.
   - Renders cover candidates (Pages 1–3) to `50_COVERS/<book_id>/cover.png`.
   - Builds encrypted `.hscp` package to `20_SECURE_BOOKS/<book_id>/v1.hscp`.
   - Generates SQLite FTS5 search index to `40_SEARCH_INDEXES/<book_id>/search.pack`.
5. **Review**: Item transitions to `ready_for_review`.
6. **Publish**: Pointers switch atomically; book becomes visible in mobile app catalog.
