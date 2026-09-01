# Architecture

## Principle: database is a catalog, not a blob warehouse

Supabase stores normalized relationships and user state. Google Drive stores large immutable/origin objects. Content packs prevent a million CQ records from bloating Postgres.

```text
Mobile ── Supabase Auth/Data API ── Postgres
  │                                  │
  │                                  └─ books, versions, chapters, packs, progress, bookmarks
  │
  ├─ license Edge Function ── decrypt server-wrapped content key ── X25519-wrap for device
  │
  └─ encrypted HSCP package delivery ── Drive origin / R2 hot-cache

Admin ── Ingest API ── Python worker ── Drive
                       │
                       ├─ PDF/TOC parser
                       ├─ content normalizer
                       ├─ dedupe/confidence
                       ├─ search/content pack builder
                       └─ HSCP encryptor
```

## Data tiers

### Tier A — Postgres hot metadata

- user profile and devices
- subjects / canonical syllabus / books / versions / chapter page ranges
- content-pack pointers, counts, hashes and versions
- progress/bookmarks/notes/attempt summaries
- entitlement and license state
- import job state and audit trail

### Tier B — object storage

- original PDFs (private)
- HSCP encrypted packages
- content packs (`.jsonl.zst`, `.sqlite`, `.parquet` as your stack matures)
- search indexes, thumbnails and covers
- import source files and rollback artifacts

### Tier C — device cache

- SQLite catalog and FTS index
- encrypted HSCP packages in app-private storage
- OS-keystore-protected device private key
- short-lived content keys/licenses
- temporary decrypted PDF in cache only while reader is open

## Canonical syllabus layer

Do not structure the product around publisher-specific chapter names. Create canonical subject/paper/chapter entities, then map every book and question to those entities. This lets one formula link to several books/pages and thousands of questions without duplication.

## Atomic publication

Every import builds a draft version. After validation, switch a small `published_version_id` pointer. Rollback switches the pointer back; clients sync catalog version deltas instead of reloading everything.
