# Database Audit & Supabase RLS Matrix

**Migration Sources**:
- `supabase/migrations/0001_init.sql` (Core schema, RLS, triggers & indexes)
- `supabase/migrations/0002_seed_demo.sql` (Seed data for subjects, books, syllabus chapters, formulas & feature flags)

---

## 1. Storage Architecture Principle Verification

> [!IMPORTANT]
> **VERIFIED**: No PostgreSQL table stores binary PDF blobs, large byte arrays, or uncompressed question data.
> - Heavy content (300 MB+ PDFs, encrypted `.hscp` chunks, `.jsonl.zst` packs, `.sqlite` indexes) resides in Google Drive 5TB or local warehouse origin.
> - PostgreSQL holds only string pointers (`original_object_id`, `secure_object_id`, `delivery_url`), cryptographic hashes (`package_sha256`, `source_hash`), and relational metadata.

---

## 2. Table-by-Table Audit Matrix

| Table Name | Purpose | Primary Key | Foreign Keys | RLS Enabled | Mobile Access | Admin / Worker Access |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`profiles`** | User metadata (full name, HSC year, board, group) | `id (uuid)` | `auth.users(id)` | **YES** | SELECT/INSERT/UPDATE (Owner only: `auth.uid() = id`) | Service-role bypass |
| **`devices`** | Registered user devices & X25519 public keys | `id (uuid)` | `user_id -> auth.users(id)` | **YES** | SELECT/INSERT/UPDATE (Owner only: `auth.uid() = user_id`) | Service-role (revocation & audit) |
| **`subjects`** | HSC subject definitions (Physics, Chem, Math, Bio) | `id (text)` | None | **YES** | SELECT (`is_active = true`) | Service-role full access |
| **`syllabus_chapters`** | Canonical syllabus chapters (independent of publisher) | `id (uuid)` | `subject_id -> subjects(id)` | **YES** | SELECT (`true`) | Service-role full access |
| **`books`** | Catalog books & published edition pointers | `id (uuid)` | `subject_id -> subjects(id)`, `published_version_id -> book_versions(id)` | **YES** | SELECT (`is_published = true`) | Service-role write / upsert |
| **`book_versions`** | Versioned book artifacts, page counts & storage pointers | `id (uuid)` | `book_id -> books(id)` | **YES** | SELECT (`is_active = true AND book.is_published = true`) | Worker upsert & version switch |
| **`book_secrets`** | Server master-key wrapped content keys | `book_version_id (uuid)` | `book_versions(id)` | **YES** | **BLOCKED** (No client policy exists; Edge Function only) | Service-role read/write |
| **`book_chapters`** | Chapter page bounds (`start_page`, `end_page`) | `id (uuid)` | `book_id -> books(id)`, `book_version_id -> book_versions(id)` | **YES** | SELECT (Published books only) | Worker extraction & publish |
| **`content_packs`** | Object pointers for bulk CQs, MCQs & search packs | `id (uuid)` | `subject_id -> subjects(id)` | **YES** | SELECT (`is_published = true`) | Worker packing & publishing |
| **`formula_catalog`** | High-value normalized formulas for instant mobile UI | `id (uuid)` | `subject_id -> subjects(id)`, `source_pack_id -> content_packs(id)` | **YES** | SELECT (`is_published = true`) | Worker staging & publish |
| **`entitlements`** | User book licenses, access grants & expiration | `id (uuid)` | `user_id -> auth.users(id)`, `book_id -> books(id)` | **YES** | SELECT (Owner only: `auth.uid() = user_id`) | Service-role grant/revoke |
| **`reading_progress`** | User reading position (page number, percentage) | `(user_id, book_id)` | `user_id -> auth.users(id)`, `book_id -> books(id)` | **YES** | ALL (`auth.uid() = user_id`) | Service-role read |
| **`bookmarks`** | User saved page bookmarks and notes | `id (uuid)` | `user_id -> auth.users(id)`, `book_id -> books(id)` | **YES** | ALL (`auth.uid() = user_id`) | Service-role read |
| **`feature_flags`** | Remote feature toggles & runtime configs | `key (text)` | None | **YES** | SELECT (`true`) | Service-role update |
| **`home_sections`** | Dynamic home screen layout & section order | `id (uuid)` | None | **YES** | SELECT (`enabled = true`) | Service-role update |
| **`import_audit`** | Audit trail for worker import jobs & hashes | `id (uuid)` | None | **YES** | **BLOCKED** (Service-role only) | Worker write |
| **`content_pack_audit`**| Audit trail for generated content packs | `id (uuid)` | None | **YES** | **BLOCKED** (Service-role only) | Worker write |

---

## 3. Row-Level Security (RLS) Policy Verification

### Public / Student Read Access:
- **`published books readable`**: `ON public.books FOR SELECT USING (is_published = true)`
- **`active published book versions readable`**: `ON public.book_versions FOR SELECT USING (is_active = true AND EXISTS (SELECT 1 FROM public.books b WHERE b.id = book_id AND b.is_published = true))`
- **`published book chapters readable`**: `ON public.book_chapters FOR SELECT USING (EXISTS (SELECT 1 FROM public.books b WHERE b.id = book_id AND b.is_published = true))`
- **`published packs readable`**: `ON public.content_packs FOR SELECT USING (is_published = true)`
- **`published formulas readable`**: `ON public.formula_catalog FOR SELECT USING (is_published = true)`

### Sensitive Data Isolation:
- **`book_secrets`**: Has RLS enabled with **ZERO client policies**. Regular Supabase client tokens cannot query `book_secrets`. Only the Edge Function using `SUPABASE_SERVICE_ROLE_KEY` can read wrapped keys to perform license verification.

---

## 4. Trigger & Automation Audit

1. **`on_auth_user_created`**:
   - Fires `AFTER INSERT ON auth.users FOR EACH ROW`.
   - Executes `public.handle_new_user()`, automatically creating a default record in `public.profiles` with `full_name`.
2. **`profiles_touch` & `books_touch`**:
   - Fires `BEFORE UPDATE` to maintain `updated_at = now()`.

---

## 5. Performance Indexes

```sql
CREATE INDEX book_versions_book_idx ON public.book_versions(book_id, version desc);
CREATE INDEX book_chapters_book_idx ON public.book_chapters(book_id, sort_order);
CREATE INDEX packs_subject_idx ON public.content_packs(subject_id, pack_type, is_published);
CREATE INDEX progress_user_idx ON public.reading_progress(user_id, last_read_at desc);
CREATE INDEX bookmarks_user_idx ON public.bookmarks(user_id, created_at desc);
CREATE INDEX entitlements_user_idx ON public.entitlements(user_id, book_id);
CREATE INDEX idx_books_status_subject ON public.books(status, subject_id, paper);
CREATE INDEX idx_books_search_lookup ON public.books(title, publisher, edition);
CREATE INDEX idx_book_versions_status ON public.book_versions(book_id, is_active, status);
CREATE INDEX idx_content_issues_lookup ON public.content_issues(book_id, status, priority);
CREATE INDEX idx_book_audit_timeline ON public.book_audit_log(book_id, created_at desc);
CREATE INDEX idx_book_relationships_lookup ON public.book_relationships(book_version_id, page_number);
```

---

## 6. Phase 16 CMS & Versioning Tables (Migration 0011)

| Table Name | Purpose | Primary Key | Foreign Keys | RLS Enabled | Mobile Access | Admin / Worker Access |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`book_chapter_revisions`** | Versioned non-destructive chapter mapping drafts | `id (uuid)` | `book_id -> books(id)`, `book_version_id -> book_versions(id)` | **YES** | **BLOCKED** (Admin only) | Service-role full access |
| **`content_issues`** | Content issue tickets & student error reports | `id (uuid)` | `book_id -> books(id)` | **YES** | INSERT (Student reporting) | Service-role review/resolve |
| **`book_audit_log`** | Immutable timeline of sensitive administrative actions | `id (uuid)` | `book_id -> books(id)` | **YES** | **BLOCKED** (Admin only) | Service-role insert only |
| **`book_relationships`** | Version-aware formula, CQ, and concept links | `id (uuid)` | `book_id -> books(id)`, `book_version_id -> book_versions(id)` | **YES** | SELECT (`is_published = true`) | Service-role full access |

**Audit Verdict**: Indexing covers all critical user-bound, CMS catalog filtering, and publication foreign key query paths.
