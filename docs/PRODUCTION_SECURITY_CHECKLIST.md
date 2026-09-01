# Production Security Checklist & Hardening Matrix

This checklist verifies all security controls across the database, worker, storage, admin studio, and mobile client before public release.

---

## 1. Security Verification Matrix

| Area | Security Requirement | Status | Verification Detail |
|---|---|---|---|
| **Database & RLS** | Zero bytea / binary blobs in PostgreSQL | **VERIFIED** | Storage pointers only in `book_versions` |
| **Database & RLS** | Student queries restricted to published books | **VERIFIED** | `is_published = true AND is_active = true` RLS policy |
| **Database & RLS** | `book_secrets` table blocked from client access | **VERIFIED** | Zero client policies; Edge Function only |
| **Database & RLS** | User reading progress & bookmarks user-isolated | **VERIFIED** | Enforces `auth.uid() = user_id` |
| **Secrets & Keys** | Master key never bundled in mobile app or admin UI | **VERIFIED** | `CONTENT_MASTER_KEY_B64` server-only |
| **Secrets & Keys** | Service role key never exposed to client tokens | **VERIFIED** | Worker & Edge Function restricted |
| **Secrets & Keys** | Repository git history clean of real credentials | **VERIFIED** | Secret scan verified in Phase 18 suite |
| **Storage & Drive** | Original source PDFs private & unshared | **VERIFIED** | Google Drive `10_ORIGINALS` private |
| **Storage & Drive** | No public `drive.google.com/uc?id=` student links | **VERIFIED** | Delivery uses encrypted `.hscp` chunks |
| **HSCP Container** | Streaming AES-256-GCM chunked encryption | **VERIFIED** | 12-byte unique nonces, 16-byte auth tags |
| **HSCP Container** | SHA-256 package hash integrity verification | **VERIFIED** | Tampered packages rejected on download |
| **Reader Privacy** | Hardware screenshot protection on mobile reader | **VERIFIED** | Native OS flag enabled during reader mount |
| **Reader Privacy** | Transient plaintext purged on unmount & background | **VERIFIED** | App-private sandbox directory purged |
| **Admin & Publishing** | Publication strictly blocked for `UNVERIFIED` rights | **VERIFIED** | Server-side `validate_book_publication` |
| **Admin & Publishing** | Manual admin edits locked against overwrite | **VERIFIED** | `metadata_locked_by_admin = true` |
| **Web Security** | Security headers configured on Admin Next.js | **VERIFIED** | `nosniff`, `SAMEORIGIN`, `XSS`, `Referrer-Policy` |

---

## 2. Emergency Security Response

- **Rights Complaint**: Immediately navigate to `/books/[bookId]`, click **Unpublish**, and set rights to `INTERNAL_ONLY`. Student mobile catalog sync hides the book instantly without deleting historical progress.
- **Key Compromise**: Rotate `CONTENT_MASTER_KEY_VERSION` to 2. Re-encrypt active packages via worker and update `book_secrets`.
