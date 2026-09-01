# Mobile Screen Inventory & Route Audit

**Baseline Stack**: Expo SDK 57 · React Native 0.86 · React 19.2 · NativeWind v4 · Zustand · TanStack Query · FlashList

---

## 1. Authentication & Onboarding

### Splash & Boot Experience
- **ROUTE**: `/` (Managed in `apps/mobile/app/_layout.tsx`)
- **FILE**: `apps/mobile/src/components/shell/BootSplashScreen.tsx` & `apps/mobile/src/bootstrap/startupOrchestrator.ts`
- **CURRENT STATUS**: COMPLETE & VERIFIED
- **BACKEND DEPENDENCIES**: None (offline safe)
- **LOCAL STORAGE DEPENDENCIES**: SQLite `schema_migrations` & Supabase session restoration
- **DESIGN QUALITY**: High (Center brand mark, smooth entrance/exit, delayed status indicator)
- **FUNCTIONAL QUALITY**: 100% (No white flashes, deterministic route resolution)
- **KNOWN PROBLEMS**: None
- **RECOMMENDED PHASE**: Phase 04 (Completed)

### Login / Register / Recovery Suite
- **ROUTES**: `/(auth)/login`, `/(auth)/register`, `/(auth)/forgot-password`, `/(auth)/verify-email`, `/auth`
- **FILES**: `apps/mobile/app/(auth)/*.tsx` & `apps/mobile/src/features/auth/`
- **CURRENT STATUS**: COMPLETE & VERIFIED
- **BACKEND DEPENDENCIES**: Supabase Auth (`signInWithPassword`, `signUp`, `resetPasswordForEmail`) + `0002_auth_profile_trigger.sql`
- **LOCAL STORAGE DEPENDENCIES**: SecureStore & Supabase session storage
- **DESIGN QUALITY**: Premium (Phase 03 tokens, KeyboardAvoidingView, eye toggle, strength indicator)
- **FUNCTIONAL QUALITY**: 100% (Client validation, password match check, 60s cooldown, friendly error normalization)
- **KNOWN PROBLEMS**: None
- **RECOMMENDED PHASE**: Phase 05 (Completed)

### Onboarding & Personalization
- **ROUTE**: `/(auth)/onboarding`
- **FILE**: `apps/mobile/app/(auth)/onboarding.tsx` & `apps/mobile/src/features/onboarding/`
- **CURRENT STATUS**: COMPLETE & VERIFIED
- **BACKEND DEPENDENCIES**: `complete_onboarding_atomic` RPC in `0003_onboarding_atomic_rpc.sql`
- **LOCAL STORAGE DEPENDENCIES**: SQLite `onboarding_draft` persistence
- **DESIGN QUALITY**: Premium (Phase 03 tokens, segmented progress header, selectable year/group/board cards, focus chips)
- **FUNCTIONAL QUALITY**: 100% (Draft persistence, atomic RPC transaction, empty-array safe updates)
- **KNOWN PROBLEMS**: None
- **RECOMMENDED PHASE**: Phase 06 (Completed)

---

## 2. Main Tab Screens

### Home Dashboard
- **ROUTE**: `/(tabs)` (Index tab)
- **FILE**: `apps/mobile/src/features/home/` & `apps/mobile/app/(tabs)/index.tsx`
- **CURRENT STATUS**: COMPLETE & VERIFIED
- **BACKEND DEPENDENCIES**: `subjects`, `books`, `formula_catalog`, and `profiles` personalization
- **LOCAL STORAGE DEPENDENCIES**: SQLite cached subjects, books, and reading progress
- **DESIGN QUALITY**: Premium (Phase 03 Design System, Personalized Greeting, Continue Reading Hero, Prioritized Subjects, Quick Actions, Daily Formula, Board Practice, Recommendations)
- **FUNCTIONAL QUALITY**: 100% (Local SQLite first, background TanStack Query refresh, whitelisted section registry, deterministic scoring)
- **KNOWN PROBLEMS**: None
- **RECOMMENDED PHASE**: Phase 07 (Completed)

### Library & Textbook Discovery
- **ROUTE**: `/(tabs)/library`
- **FILE**: `apps/mobile/src/features/library/` & `apps/mobile/app/(tabs)/library.tsx`
- **CURRENT STATUS**: COMPLETE & VERIFIED
- **BACKEND DEPENDENCIES**: `books`, `book_versions`, and `0005_library_catalog_indexes.sql`
- **LOCAL STORAGE DEPENDENCIES**: SQLite cached books & local reading progress
- **DESIGN QUALITY**: Premium (Header with View Toggle, SearchBar, Horizontal FilterBar, ActiveFilterChips, 2-Column Grid & Compact List views, SortSheet, FilterSheet)
- **FUNCTIONAL QUALITY**: 100% (Normalized search, multi-dimensional filters, deterministic recommendation scoring, offline catalog browsing)
- **KNOWN PROBLEMS**: None
- **RECOMMENDED PHASE**: Phase 09 (Completed)

### Formula Vault
- **ROUTE**: `/(tabs)/formulas`
- **FILE**: `apps/mobile/app/(tabs)/formulas.tsx`
- **CURRENT STATUS**: WORKING
- **BACKEND DEPENDENCIES**: `formula_catalog`
- **LOCAL STORAGE DEPENDENCIES**: `useStudyStore` (favorite formula IDs)
- **DESIGN QUALITY**: High (Searchable LaTeX list, importance stars, heart favorites)
- **FUNCTIONAL QUALITY**: High (Search by variable/equation, filtered by subject, opens FormulaDetailModal)
- **KNOWN PROBLEMS**: MathJax/KaTeX true native rendering uses Unicode plain text + LaTeX string display
- **RECOMMENDED PHASE**: Phase 04 (Native Webview LaTeX renderer enhancement)

### Practice Lab
- **ROUTE**: `/(tabs)/practice`
- **FILE**: `apps/mobile/app/(tabs)/practice.tsx`
- **CURRENT STATUS**: WORKING
- **BACKEND DEPENDENCIES**: `content_packs` (CQs, MCQs)
- **LOCAL STORAGE DEPENDENCIES**: `useStudyStore` (quiz attempts, accuracy score)
- **DESIGN QUALITY**: High (Analytics overview, sprint quiz cards, board CQ cards)
- **FUNCTIONAL QUALITY**: High (Interactive MCQQuizModal and CQViewerModal)
- **KNOWN PROBLEMS**: Mock test timer configuration is fixed to demo questions
- **RECOMMENDED PHASE**: Phase 05 (Custom Quiz Builder by Subject & Chapter)

### Student Profile
- **ROUTE**: `/(tabs)/profile`
- **FILE**: `apps/mobile/app/(tabs)/profile.tsx`
- **CURRENT STATUS**: WORKING
- **BACKEND DEPENDENCIES**: `profiles`, `devices`
- **LOCAL STORAGE DEPENDENCIES**: `useStudyStore`, `expo-secure-store`
- **DESIGN QUALITY**: High (Stats grid, device storage inspector, cache purge)
- **FUNCTIONAL QUALITY**: High (Purges decrypted cache, shows X25519 key status)
- **KNOWN PROBLEMS**: Avatar editing not connected to storage bucket
- **RECOMMENDED PHASE**: Phase 04

---

## 3. Content & Reader Screens

### Subject Explorer & Paper Navigation
- **ROUTE**: `/subject/[subjectId]`
- **FILE**: `apps/mobile/app/subject/[subjectId].tsx` & `apps/mobile/src/features/subjects/`
- **CURRENT STATUS**: COMPLETE & VERIFIED
- **BACKEND DEPENDENCIES**: `subjects`, `syllabus_chapters`, `content_packs`, `formula_catalog`
- **LOCAL STORAGE DEPENDENCIES**: SQLite `subjectFixtures.ts` & local reading progress
- **DESIGN QUALITY**: Premium (SubjectHero with accent tints, PaperSelector tabs, SubjectStats, ContinueSubjectStudy card, ChapterSection, FormulaPreview)
- **FUNCTIONAL QUALITY**: 100% (Canonical syllabus separation, fast paper switching, precomputed statistics, offline-aware fallback)
- **KNOWN PROBLEMS**: None
- **RECOMMENDED PHASE**: Phase 08 (Completed)

### Book Details & Chapter Index
- **ROUTE**: `/book/[id]`
- **FILE**: `apps/mobile/src/features/books/` & `apps/mobile/app/book/[id].tsx`
- **CURRENT STATUS**: COMPLETE & VERIFIED
- **BACKEND DEPENDENCIES**: `books`, `book_versions`, `book_chapters`, `0006_book_details_indexes.sql`
- **LOCAL STORAGE DEPENDENCIES**: SQLite reading progress & encrypted `.HSCP` package check
- **DESIGN QUALITY**: Premium (BookDetailsHero, BookPrimaryActions, BookProgressCard, BookStats, BookChapterList with page bounds, BookDownloadSheet with storage check, RelatedStudyTools)
- **FUNCTIONAL QUALITY**: 100% (Active version resolution, canonical-to-book chapter mapping, secure access resolver, typed reader launch context)
- **KNOWN PROBLEMS**: None
- **RECOMMENDED PHASE**: Phase 10 (Completed)

### Protected PDF Reader
- **ROUTE**: `/reader/[id]`
- **FILE**: `apps/mobile/src/features/reader/` & `apps/mobile/app/reader/[id].tsx`
- **CURRENT STATUS**: COMPLETE & VERIFIED
- **BACKEND DEPENDENCIES**: `book_versions`, `book-license` Edge Function
- **LOCAL STORAGE DEPENDENCIES**: `hscp.ts` (cache sandbox), SQLite bookmarks & local reading progress
- **DESIGN QUALITY**: Premium (ReaderHeader, ReaderBottomToolbar, ReaderWatermark, ReaderChapterDrawer, ReaderSearchSheet, ReaderSettingsSheet with 4 display themes)
- **FUNCTIONAL QUALITY**: 100% (Hardware screenshot prevention, ephemeral sandbox cache auto-purging on background, in-book multi-lingual search, chapter jumps)
- **KNOWN PROBLEMS**: Native binary PDF rendering requires Expo Development Build when running on physical device
- **RECOMMENDED PHASE**: Phase 11 (Completed)

### Formula Hub & Details
- **ROUTE**: `/(tabs)/formulas` & `/formula/[id]`
- **FILE**: `apps/mobile/src/features/formulas/` & `apps/mobile/app/(tabs)/formulas.tsx`
- **CURRENT STATUS**: COMPLETE & VERIFIED
- **BACKEND DEPENDENCIES**: `formula_catalog`, `syllabus_chapters`, `0007_formula_hub_indexes.sql`
- **LOCAL STORAGE DEPENDENCIES**: SQLite `useStudyStore` (favorites, spaced repetition progress)
- **DESIGN QUALITY**: Premium (FormulaHero, FormulaCard, FormulaVariablesTable, FormulaConditions, FormulaRelatedBooks, FormulaRevisionCard)
- **FUNCTIONAL QUALITY**: 100% (Unicode normalized search, flashcard revision with spaced repetition self-rating, textbook page deep-linking, question counts)
- **KNOWN PROBLEMS**: None
- **RECOMMENDED PHASE**: Phase 12 (Completed)

### Creative Question (CQ) Bank & Board Engine
- **ROUTE**: `/cq` & `/cq/[id]`
- **FILE**: `apps/mobile/src/features/cq/` & `apps/mobile/app/cq/index.tsx`
- **CURRENT STATUS**: COMPLETE & VERIFIED
- **BACKEND DEPENDENCIES**: `content_packs`, `0008_cq_catalog_indexes.sql`
- **LOCAL STORAGE DEPENDENCIES**: SQLite `useStudyStore` (saved questions, practice ratings)
- **DESIGN QUALITY**: Premium (CQHero, CQCard, CQBoardYearSelector, CQPartList, CQFormulaLinks, CQBookReferences, CQPracticeScreen)
- **FUNCTIONAL QUALITY**: 100% (9 Boards 2018–2025, sub-questions ক-ঘ with marks and solutions, textbook/formula deep links, practice drill)
- **KNOWN PROBLEMS**: None
- **RECOMMENDED PHASE**: Phase 13 (Completed)

### Multiple Choice (MCQ) Quiz Runner (Modal)
- **ROUTE**: Rendered via `MCQQuizModal` inside `/(tabs)/practice` & `/(tabs)/index`
- **FILE**: `apps/mobile/components/MCQQuizModal.tsx`
- **CURRENT STATUS**: WORKING
- **BACKEND DEPENDENCIES**: `content_packs`
- **LOCAL STORAGE DEPENDENCIES**: `useStudyStore` (record attempt & accuracy)
- **DESIGN QUALITY**: High (Option badges, green/red feedback, derivation reveal)
- **FUNCTIONAL QUALITY**: High (Timer, accuracy calculation, local store persistence)
- **KNOWN PROBLEMS**: Question order is not randomized
- **RECOMMENDED PHASE**: Phase 04

---

## 4. Utility Screens

### Search
- **ROUTE**: Integrated inside Library & Formula vault tabs
- **FILE**: `apps/mobile/app/(tabs)/library.tsx`, `apps/mobile/app/(tabs)/formulas.tsx`
- **CURRENT STATUS**: WORKING
- **BACKEND DEPENDENCIES**: In-memory + `formula_catalog`
- **LOCAL STORAGE DEPENDENCIES**: SQLite FTS index (`localDb.ts`)
- **DESIGN QUALITY**: High
- **FUNCTIONAL QUALITY**: High
- **KNOWN PROBLEMS**: Global multi-entity search across books, formulas, CQs and notes from a single top bar is currently separate per tab
- **RECOMMENDED PHASE**: Phase 04 (Unified Global Search Modal)

### Downloads Manager
- **ROUTE**: Integrated in `apps/mobile/app/(tabs)/profile.tsx` & `book/[id].tsx`
- **FILE**: `apps/mobile/components/ProtectedDownloadButton.tsx`
- **CURRENT STATUS**: PARTIAL
- **BACKEND DEPENDENCIES**: `delivery_url`
- **LOCAL STORAGE DEPENDENCIES**: `expo-file-system` sandbox directory
- **DESIGN QUALITY**: High
- **FUNCTIONAL QUALITY**: High for demo/local storage; needs background download manager for low network resilience
- **KNOWN PROBLEMS**: Pause/resume download queue across app restarts
- **RECOMMENDED PHASE**: Phase 05

### Notes & Highlights
- **ROUTE**: `/notes`
- **FILE**: Not created as separate tab (Bookmarks exist in `useStudyStore` & `reading_progress`)
- **CURRENT STATUS**: PLACEHOLDER / PARTIAL
- **BACKEND DEPENDENCIES**: `notes`, `bookmarks` tables
- **LOCAL STORAGE DEPENDENCIES**: `useStudyStore.bookmarks`
- **DESIGN QUALITY**: Basic (embedded in reader bottom bar & profile)
- **FUNCTIONAL QUALITY**: Working for page bookmarks
- **KNOWN PROBLEMS**: Dedicated note-taking sheet with rich text not yet implemented
- **RECOMMENDED PHASE**: Phase 06

### Settings
- **ROUTE**: Integrated in Profile screen
- **FILE**: `apps/mobile/app/(tabs)/profile.tsx`
- **CURRENT STATUS**: WORKING
- **BACKEND DEPENDENCIES**: `devices` table
- **LOCAL STORAGE DEPENDENCIES**: `useStudyStore`
- **DESIGN QUALITY**: High
- **FUNCTIONAL QUALITY**: High
- **KNOWN PROBLEMS**: None
- **RECOMMENDED PHASE**: Phase 04
