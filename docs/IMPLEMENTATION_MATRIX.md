# Implementation & Feature Matrix

| Feature / Subsystem | Existing | Quality | Backend Status | UI Status | Security Status | Current / Next Phase |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin PDF Upload Studio** | Yes | Premium | Worker `/v1/uploads/pdf/session` | `/books/import` & `PdfDropZone` | Zero secrets in browser | **PHASE 14 COMPLETE** |
| **Bulk PDF Ingestion** | Yes | Premium | `import_folder.py` & Multi-drop | UploadQueue + ProcessingPipeline | Controlled concurrency | **PHASE 14 COMPLETE** |
| **Resumable 300MB–2GB Upload** | Yes | Premium | 8MB chunked upload stream | Resumable chunk client | Streamed to disk (O(1) RAM) | **PHASE 14 COMPLETE** |
| **Drive Private Warehouse** | Yes | Premium | `10_ORIGINALS`, `20_SECURE_BOOKS` | Local / Drive abstraction | Zero direct public links | **PHASE 14 COMPLETE** |
| **Auto Book & Cover Extraction**| Yes | Premium | PyMuPDF Cover render (Page 1) | `50_COVERS/` + Thumbnail preview | Non-intrusive aspect ratio | **PHASE 14 COMPLETE** |
| **Subject / Paper Detection** | Yes | Premium | Bangla/English keyword regex | `MetadataEditor.tsx` | Admin reviewable override | **PHASE 14 COMPLETE** |
| **Auto TOC & Chapter Mapping** | Yes | Premium | Outline ➔ Printed TOC ➔ Headings | `ChapterReview.tsx` table | Boundary-clamped ranges | **PHASE 14 COMPLETE** |
| **HSCP Package Generation** | Yes | Premium | Streaming AES-256-GCM chunks | Encrypted `.hscp` output | Server master key wrapped | **PHASE 14 COMPLETE** |
| **Rights & Licensing Guards** | Yes | Premium | `rights_status` in `0009_migration` | `RightsEditor.tsx` | Unverified blocks student publish | **PHASE 14 COMPLETE** |
| **Atomic Publish & Rollback** | Yes | Premium | Version pointer switch | `PublishPanel.tsx` | `< 10ms` instant rollback | **PHASE 14 COMPLETE** |
| **Dynamic Mobile Sync** | Yes | Premium | Dynamic `getBooks()` + Chapter map | Zero code changes for new books | Instant library appearance | **PHASE 14 COMPLETE** |
| **Board CQ Explorer & Engine**| Yes| Premium | `content_packs` + `0008_indexes.sql` | `src/features/cq/` | Content pack isolation | **PHASE 13 COMPLETE** |
| **CQ Sub-Questions & Solutions**| Yes| Premium | Structured parts (ক..ঘ) | `CQPartList.tsx` (Accordions) | Safe local reveal | **PHASE 13 COMPLETE** |
| **Board / Year Multi-Filter** | Yes | Premium | 9 Boards (2018–2025) | `CQBoardYearSelector.tsx` | Normalized query | **PHASE 13 COMPLETE** |
| **CQ ↔ Formula / Book Links** | Yes | Premium | Knowledge Graph links | `CQFormulaLinks` & `CQBookReferences` | Deep-link to reader | **PHASE 13 COMPLETE** |
| **Million-CQ Streaming Pipeline**| Yes| High | JSONL stream + fingerprint dedup| Staging tables | No direct AI writes | **PHASE 13 COMPLETE** |
| **Formula Vault & Knowledge Graph** | Yes | Premium | `formula_catalog` + `0007_indexes.sql` | `src/features/formulas/` | Safe catalog | **PHASE 12 COMPLETE** |
| **Formula Details & Cross-Linking** | Yes | Premium | `knowledgeLinks` resolver | Big Equation + Variables Table | Deep-link to reader | **PHASE 12 COMPLETE** |
| **Formula Flashcard Revision** | Yes | Premium | Spaced Repetition (1d..60d) | `FormulaRevisionCard.tsx` | Local-first sync | **PHASE 12 COMPLETE** |
| **Secure PDF Reader** | Yes | Premium | `book_versions` + License API | 4 Themes (`src/features/reader/`) | Sandbox cache purge | **PHASE 11 COMPLETE** |
| **Screenshot Guard** | Yes | Premium | Native OS hooks | `screenCapture.ts` | Hardware blocked | **PHASE 11 COMPLETE** |
| **Dynamic Watermarking** | Yes | Premium | Session hash generator | `ReaderWatermark.tsx` | Non-intrusive overlay | **PHASE 11 COMPLETE** |
| **In-Book Search** | Yes | Premium | Chapter & keyword index | `ReaderSearchSheet.tsx` | Localized Unicode | **PHASE 11 COMPLETE** |
| **Display Eye Comfort** | Yes | Premium | Tokenized themes | Sepia, Dark, Midnight, Original | Persisted locally | **PHASE 11 COMPLETE** |
| **Book Details & Index** | Yes | Premium | `book_chapters` mapping | Complete (`/book/[id]`) | Safe metadata | **PHASE 10 COMPLETE** |
| **Active Version Resolution** | Yes | Premium | `book_versions` active pointer| `useBookDetails.ts` resolver | Staging isolated | **PHASE 10 COMPLETE** |
| **Secure Access Preparation** | Yes | Premium | Entitlement & status resolver | `bookAccessResolver.ts` | Zero keys in client | **PHASE 10 COMPLETE** |
| **Offline Download Entry** | Yes | High | Encrypted `.HSCP` descriptor | `BookDownloadSheet.tsx` | Storage check | **PHASE 10 COMPLETE** |
| **Book Library & Discovery** | Yes | Premium | `books` + `book_versions` | 2-View Mode (`apps/mobile/src/features/library/`) | Read-only RLS | **PHASE 09 COMPLETE** |
| **Catalog Search & Filtering**| Yes| Premium | Indexed query (`0005_indexes.sql`) | Normalized search & Sheet filters | Multi-field sanitized | **PHASE 09 COMPLETE** |
| **Recommendation Sorting** | Yes | Premium | Deterministic scoring algorithm | `librarySorting.ts` (6 Sort Modes) | Safe local compute | **PHASE 09 COMPLETE** |
| **Offline Library Browsing** | Yes | High | SQLite cached books | Instant offline rendering | Local sandbox | **PHASE 09 COMPLETE** |
| **Subject Explorer** | Yes | Premium | `syllabus_chapters` + Indexes | Complete (`/subject/[subjectId]`) | Read-only RLS | **PHASE 08 COMPLETE** |
| **Paper Navigation** | Yes | Premium | Paper number mapping | Interactive tabs (`PaperSelector.tsx`) | Safe local state | **PHASE 08 COMPLETE** |
| **Canonical Chapter Discovery**| Yes| Premium | `syllabus_chapters` catalog | `ChapterSection.tsx` & `ChapterCard` | Decoupled from books | **PHASE 08 COMPLETE** |
| **Subject Statistics** | Yes | High | Aggregated counts | `SubjectStats.tsx` (4 Cards) | Precomputed metadata | **PHASE 08 COMPLETE** |
| **Home Dashboard** | Yes | Premium | Catalog & Profile queries | Modular Feed (`src/features/home/`) | Read-only RLS | **PHASE 07 COMPLETE** |
| **Continue Reading** | Yes | Premium | SQLite reading progress | Hero Card (`ContinueReadingSection.tsx`) | Safe local sync | **PHASE 07 COMPLETE** |
| **Remote Section Engine** | Yes | Premium | Whitelisted section config | `HomeSectionRegistry.tsx` | Clamped & Sanitized | **PHASE 07 COMPLETE** |
| **Smart Personalization** | Yes | High | Academic context rules | `personalizationRules.ts` | Deterministic ranking | **PHASE 07 COMPLETE** |
| **Onboarding Gateway** | Yes | Premium | Atomic RPC (`0003_rpc.sql`) | Polished 6-step flow (`/(auth)/onboarding`) | Transactional RLS | **PHASE 06 COMPLETE** |
| **Academic Personalization**| Yes| Premium | Profile preferences (`preferred_subjects`) | Context selectors (`personalization.ts`) | User-bound | **PHASE 06 COMPLETE** |
| **Draft Persistence** | Yes | High | SQLite `cached_content` store | Restore on app resume | On-device sandbox | **PHASE 06 COMPLETE** |
| **Login / Register / Recovery** | Yes | Premium | Supabase Auth + Trigger | Polished Suite (`/(auth)/*`) | Secure token persistence | **PHASE 05 COMPLETE** |
| **Auth Error Normalization** | Yes | High | `authErrors.ts` mapping | Student-friendly feedback | Non-leaking errors | **PHASE 05 COMPLETE** |
| **Form Validation & Strength** | Yes | High | `authValidation.ts` | Instant feedback & match check| Pure client validation | **PHASE 05 COMPLETE** |
| **App Shell & Native Splash** | Yes | Premium | Native config in `app.json` | Dark AMOLED `#071018` | Locked | **PHASE 04 COMPLETE** |
| **Boot Splash & Orchestrator** | Yes | Premium | Staged boot sequence | Smooth brand entrance & exit | Safe offline | **PHASE 04 COMPLETE** |
| **Global Navigation Shell** | Yes | High | Expo Router stack + 5 Tabs | Design tokens + active icons | Locked | **PHASE 04 COMPLETE** |
| **Production Design System** | Yes | Premium | Tokenized (`src/theme/`) | Gallery screen active (`/dev/design-system`) | Locked | **PHASE 03 COMPLETE** |
| **Animation & Motion System** | Yes | 60 FPS | Motion tokens (`motion.ts`) | Scale press & reduced motion | Locked | **PHASE 03 COMPLETE** |
| **Foundation & Config** | Yes | High | Strict env validation (`src/config/env.ts`) | Provider tree active | Locked | **PHASE 02 LOCKED** |
| **Domain Type System** | Yes | High | Normalized `AppError` + Domain models | Typed props | Locked | **PHASE 02 LOCKED** |
| **Repository Layer** | Yes | High | Data fetching + error mapping | Zero raw DB in UI | Locked | **PHASE 02 LOCKED** |
| **Query Engine** | Yes | High | QueryKey factory + QueryClient | Cached | Locked | **PHASE 02 LOCKED** |
| **MCQ Practice Sprint** | Yes | High | Content packs | Interactive quiz with derivation | Local score analytics | Phase 15 |
