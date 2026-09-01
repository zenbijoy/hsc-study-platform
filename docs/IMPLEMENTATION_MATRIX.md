# Implementation & Feature Matrix

| Feature / Subsystem | Existing | Quality | Backend Status | UI Status | Security Status | Recommended Phase |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Splash Screen** | Yes | Good | Static | Minimalist redirect | Clean | Phase 03 |
| **Login / Register** | Yes | High | Supabase Auth + Demo fallback | Glassmorphism dark | Secure token storage | Phase 03 |
| **Onboarding Gateway**| No | N/A | Schema ready (`profiles`) | Not implemented | N/A | Phase 03 |
| **Home Dashboard** | Yes | High | Catalog queries | Gradient hero & streak card | Read-only RLS | Phase 04 |
| **Subjects Explorer** | Yes | High | `subjects` table | Tailored accent cards | Read-only RLS | Phase 04 |
| **Library** | Yes | High | `books` + `book_versions` | FlashList with search & filters | Read-only RLS | Phase 04 |
| **Book Details** | Yes | High | `book_chapters` mapping | Chapter list & page bounds | Safe metadata | Phase 04 |
| **Secure PDF Reader** | Yes | High | `book_versions` + License API | 4 Themes, watermark, jump | Screen guard & cache purge | Phase 05 |
| **Offline Reader** | Yes | High | Encrypted `.hscp` package | Offline notice & materializer | AES-256-GCM sandbox | Phase 05 |
| **Formula Vault** | Yes | High | `formula_catalog` | LaTeX search, importance stars | Clean catalog | Phase 04 |
| **Formula Details Modal**| Yes| High | `formula_catalog` | Variables, SI units, LaTeX copy| Read-only | Phase 04 |
| **Board CQ Explorer** | Yes | High | Content packs | Stimulus, sub-questions & rubrics| Unpacked locally | Phase 04 |
| **MCQ Practice Sprint** | Yes | High | Content packs | Interactive quiz with derivation | Local score analytics | Phase 04 |
| **Global Search** | Partial| Good | In-memory + FTS helper | Tab-specific search bars | Safe query | Phase 04 |
| **Bookmarks & Highlights**| Yes| High | `bookmarks` + `reading_progress` | Embedded in reader & profile | User-bound RLS | Phase 04 |
| **Student Profile** | Yes | High | `profiles` + `devices` | Stats grid & storage manager | SecureStore & RLS | Phase 04 |
| **Admin Dashboard** | Yes | High | Worker API | KPI overview cards | Staff-only | Phase 06 |
| **Admin PDF Upload** | Yes | High | Worker `/v1/imports/upload` | Dropzone with progress | Staged outside DB | Phase 06 |
| **Admin AI JSONL Import**| Yes| High | Worker `/v1/imports/text` | JSONL schema editor & sample | Staged before publish | Phase 06 |
| **Processing Pipeline**| Yes | High | PyMuPDF + Dedupe + HSCP | Live stage execution monitor | Safe worker pool | Phase 06 |
| **Atomic Publishing** | Yes | High | Supabase version pointer | Rights confirmation checkbox | Pointer switch rollback | Phase 06 |
| **Google Drive 5TB** | Yes | High | `GoogleDriveStorageProvider` | Private origin warehouse | Server-only OAuth token | Phase 02 |
| **HSCP Encryption** | Yes | High | `AES-256-GCM` chunk packager | `.hscp` container format | Master key wrapping | Phase 02 |
| **Device Licensing** | Yes | High | `supabase/functions/book-license`| X25519 handshake | Ephemeral HKDF-SHA256 | Phase 02 |
