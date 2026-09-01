# Book Versioning & Rollback Architecture

This document describes the multi-version architecture, comparison diff engine, and rollback mechanics of the HSC Study Platform.

---

## 1. Domain Entities & Invariants

The platform separates the logical textbook from its specific physical source versions:

```
┌─────────────────────────────────────────────────────────────┐
│                       Logical Book                          │
│  (id, title, subject_id, paper, publisher, published_version)│
└──────────────────────────────┬──────────────────────────────┘
                               │ 1:N
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Version 1   │       │  Version 2   │       │  Version 3   │
│  (Inactive)  │       │   (Active)   │       │   (Draft)    │
│  p.320       │       │   p.340      │       │   p.345      │
└──────────────┘       └──────────────┘       └──────────────┘
```

### Core Invariants:
1. **Source Immutability**: Active published PDF sources are immutable. Any modification to the underlying textbook PDF generates a new `BookVersion`.
2. **Single Active Version**: Exactly one `BookVersion` can be active (`is_active = true`) per published `Logical Book`.
3. **Artifact Candidate Promotion**: Secure packages (HSCP) and search packs (FTS5) are generated as candidates, validated for integrity, and only then promoted to active status.

---

## 2. Version Comparison & Diff Engine

Operators can compare two versions before promoting an update:
- **Metadata Diff**: Highlights changes to editions, academic years, and descriptions.
- **Chapter Diff**: Highlights added chapters, removed chapters, and shifted page boundaries.
- **Artifact Diff**: Displays page count differences and encrypted package size deltas.

---

## 3. Atomic Promotion & Rollback

### Promotion Workflow:
1. Operator uploads new version PDF (e.g. `v2`).
2. Automated pipeline processes and generates HSCP package and search pack.
3. Operator reviews diff and clicks **Publish Version**.
4. Database transaction updates `books.published_version_id = 'v2'`, sets `v2.is_active = true`, and sets `v1.is_active = false`.
5. Mobile clients detect the version increment on next sync.

### Rollback Workflow:
1. Operator navigates to `/books/[bookId]?tab=versions`.
2. Selects previous working version (e.g. `v1`) and clicks **Rollback**.
3. Active pointer is switched back to `v1` instantly.
4. No re-encryption or reprocessing is required.
5. All actions are recorded with before/after state in the `book_audit_log`.
