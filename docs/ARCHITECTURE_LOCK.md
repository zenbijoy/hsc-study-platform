# HSC Study Platform — Architecture Lock & System Contract

**Contract Version**: 3.0 (Phase 03 Design System & UI Contract Lock)  
**Target Audience**: All human engineers & AI coding agents (Antigravity, Codex, Copilot, Claude)

---

## 1. Immutable System Responsibilities

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE (PostgreSQL + RLS)                     │
│  - User Authentication & Profiles                                      │
│  - Relational Catalog Metadata & Active Version Pointers               │
│  - Device Registry & Public Keys (X25519)                              │
│  - User Reading Progress, Bookmarks, and Notes                         │
│  - Licensing Edge Functions (X25519 Re-wrapping)                       │
│  * NEVER store binary PDF blobs or million-record question texts!      │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Pointers & Checksums Only
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   GOOGLE DRIVE 5 TB / STORAGE ORIGIN                   │
│  - Private Original Publisher PDFs (Immutable Master Archive)          │
│  - Encrypted HSCP Packages (`.hscp` chunks)                            │
│  - Compressed Bulk Content Packs (`.jsonl.zst`)                        │
│  - Offline Full-Text Search Indexes (`.sqlite`)                        │
│  * NEVER expose direct permanent public URLs or service credentials!   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Delivery Stream / Downloads
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      STUDENT MOBILE APP (Expo 57 + RN)                 │
│  - Purely Data-Driven UI (No hardcoded formula/question screens)       │
│  - On-Device X25519 Keypair Generation (expo-secure-store)             │
│  - Screenshot Capture Blocking (useProtectedReaderScreen)              │
│  - Sandboxed Temporary Cache Materialization & Auto-Purging            │
│  - Local SQLite Cache & Debounced Reading Progress Sync                │
└────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ Ingestion & Packaging
┌────────────────────────────────────────────────────────────────────────┐
│                 PYTHON CONTENT FACTORY (FastAPI + PyMuPDF)             │
│  - Multi-format Ingestion (PDF, TXT, JSONL, CSV, Markdown)             │
│  - TOC / Outline Chapter Detection (start_page, end_page)              │
│  - RapidFuzz & SHA-256 Deduplication                                   │
│  - Disk-Backed SQLite Staging Store (Million-Record Resilient)         │
│  - AES-256-GCM Chunked HSCP Packaging & Server Key Wrapping            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Non-Negotiable AI Agent Rules

1. **Never Store Blobs in Database**: Do not add `bytea` or `blob` columns to PostgreSQL for large book files or full question banks.
2. **Never Expose Private Keys**: `SUPABASE_SERVICE_ROLE_KEY`, `CONTENT_MASTER_KEY_B64`, and Google OAuth refresh tokens must stay on private servers.
3. **Never Allow Direct AI Writes to Production**: AI-generated content must pass through Schema Validation → Staging → Deduplication → Review Gate → Atomic Publish.
4. **Data-Driven Mobile UI**: Never generate one React component per formula or question. Reusable generic engines (`FormulaCard`, `MCQQuizModal`, `CQViewerModal`) consume dynamic data.
5. **Temporary Cache Lifecycle**: A decrypted PDF may only exist temporarily in `FileSystem.cacheDirectory` while the reader is actively mounted and must be destroyed on unmount or app backgrounding.
6. **Strict TypeScript & Zero Build Warnings**: Every phase must conclude with green typecheck and validation suites.

---

## 3. UI & Design System Contract (Phase 03)

1. **Design Tokens Mandatory**: All new components and screens must consume centralized tokens from `apps/mobile/src/theme/` (`colors`, `typography`, `spacing`, `radius`, `shadows`, `motion`). Never hardcode arbitrary hex colors like `#1a1a1a` in random screens.
2. **Remote UI Safety**: Remote / dynamic database configurations may only specify approved keys (`themeKey: 'physics'`, `gradientKey: 'physicsHero'`, `variant: 'grid'`). Never accept or execute arbitrary remote JSX, CSS strings, or uncontrolled class strings.
3. **FlashList Virtualization**: All long lists (books, chapters, formula vaults, CQ banks) must use `@shopify/flash-list` with stable keys and memoized cell layout.
4. **Accessible Touch Targets**: Buttons, icon controls, and pressable cards must satisfy a minimum `44×44 pt` touch hitbox.
5. **Reduced Motion Respect**: Animated transitions and spring scales must check `useReducedMotionPreference()` and degrade gracefully to simple fades when enabled.

---

## 4. CMS, Versioning & Publishing Architecture Contract (Phase 16)

1. **Published BookVersion Source Immutability**: Active published PDF sources are immutable. Changes to the underlying PDF require creating a new `BookVersion`. Never mutate an active published version's source file in place.
2. **Manual Metadata & Chapter Override Locking**: When an admin manually edits a field or chapter boundary, the system marks `source=ADMIN_OVERRIDE` and `locked=true`. Future automated reprocessing pipelines MUST NOT silently overwrite these fields.
3. **Non-Destructive Chapter Revisions**: Editing chapter boundaries creates versioned revisions in `book_chapter_revisions` without destroying historical or draft mappings.
4. **Artifact Candidate Promotion**: Secure packages (HSCP) and search packs (FTS5) must follow `Candidate → Validate → Promote → Retain Previous`. Never activate an artifact before server-side integrity validation succeeds.
5. **Strict Student vs Admin API Boundary**: Student view models must never receive draft books, unverified rights content, internal administrative notes, or rights evidence documents.
6. **Zero-Downtime Atomic Rollback**: Version and chapter map rollbacks switch active database pointers atomically without requiring slow artifact re-encryption.
