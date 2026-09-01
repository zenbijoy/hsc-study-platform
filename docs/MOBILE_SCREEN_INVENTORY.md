# Mobile Screen Inventory & Route Audit

**Baseline Stack**: Expo SDK 57 · React Native 0.86 · React 19.2 · NativeWind v4 · Zustand · TanStack Query · FlashList

---

## 1. Authentication & Onboarding

### Splash
- **ROUTE**: `/` (Initial Redirect)
- **FILE**: `apps/mobile/app/index.tsx`
- **CURRENT STATUS**: WORKING
- **BACKEND DEPENDENCIES**: None (static bootstrap)
- **LOCAL STORAGE DEPENDENCIES**: `localStorage` session check
- **DESIGN QUALITY**: Minimalist redirect stub
- **FUNCTIONAL QUALITY**: 100% redirects directly to `/(tabs)`
- **KNOWN PROBLEMS**: No animated splash or initial onboarding check logic
- **RECOMMENDED PHASE**: Phase 03 (Dedicated Animated Splash / Onboarding Gate)

### Login / Register
- **ROUTE**: `/auth`
- **FILE**: `apps/mobile/app/auth.tsx`
- **CURRENT STATUS**: WORKING (Supabase Auth + Demo fallback)
- **BACKEND DEPENDENCIES**: `supabase.auth.signInWithPassword`, `supabase.auth.signUp`
- **LOCAL STORAGE DEPENDENCIES**: `localStorage` (session persistence)
- **DESIGN QUALITY**: High (Glassmorphism dark theme with mode toggle)
- **FUNCTIONAL QUALITY**: 90% (Supports email/password sign-in and sign-up with error handling)
- **KNOWN PROBLEMS**: OAuth (Google/Apple) providers not yet wired
- **RECOMMENDED PHASE**: Phase 03 (Social Auth & Password Reset)

### Onboarding
- **ROUTE**: `/onboarding`
- **FILE**: Not created
- **CURRENT STATUS**: NOT IMPLEMENTED
- **BACKEND DEPENDENCIES**: `profiles` table (HSC year, group selection)
- **LOCAL STORAGE DEPENDENCIES**: `has_completed_onboarding` flag
- **DESIGN QUALITY**: N/A
- **FUNCTIONAL QUALITY**: N/A
- **KNOWN PROBLEMS**: First-time users are dropped straight into tabs without HSC group/year customization
- **RECOMMENDED PHASE**: Phase 03

---

## 2. Main Tab Screens

### Home Dashboard
- **ROUTE**: `/(tabs)` (Index tab)
- **FILE**: `apps/mobile/app/(tabs)/index.tsx`
- **CURRENT STATUS**: WORKING
- **BACKEND DEPENDENCIES**: `subjects`, `books`, `formula_catalog`
- **LOCAL STORAGE DEPENDENCIES**: `useStudyStore` (streak days, study sessions)
- **DESIGN QUALITY**: High (Gradient hero card, streak counter, formula of the day)
- **FUNCTIONAL QUALITY**: High (Direct reader resume, quick quiz modal trigger)
- **KNOWN PROBLEMS**: Notification drawer icon is currently non-functional placeholder
- **RECOMMENDED PHASE**: Phase 04 (Notifications & Dynamic Announcements)

### Library
- **ROUTE**: `/(tabs)/library`
- **FILE**: `apps/mobile/app/(tabs)/library.tsx`
- **CURRENT STATUS**: WORKING
- **BACKEND DEPENDENCIES**: `books`, `book_versions`
- **LOCAL STORAGE DEPENDENCIES**: `catalog.ts` demo cache
- **DESIGN QUALITY**: High (Subject filter pills, live search bar, FlashList)
- **FUNCTIONAL QUALITY**: High (Realtime client-side search & filtering)
- **KNOWN PROBLEMS**: No sorting dropdown (e.g. Sort by Year, Recent)
- **RECOMMENDED PHASE**: Phase 04

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

### Book Details & Chapter Index
- **ROUTE**: `/book/[id]`
- **FILE**: `apps/mobile/app/book/[id].tsx`
- **CURRENT STATUS**: WORKING
- **BACKEND DEPENDENCIES**: `books`, `book_versions`, `book_chapters`
- **LOCAL STORAGE DEPENDENCIES**: `download.ts` (downloaded package check)
- **DESIGN QUALITY**: High (Glass hero card, page bounds, chapter index)
- **FUNCTIONAL QUALITY**: High (Offline download button, jump to chapter start page)
- **KNOWN PROBLEMS**: Real background download progress relies on Expo FileSystem downloadResumable
- **RECOMMENDED PHASE**: Phase 05

### Protected PDF Reader
- **ROUTE**: `/reader/[id]`
- **FILE**: `apps/mobile/app/reader/[id].tsx`
- **CURRENT STATUS**: WORKING
- **BACKEND DEPENDENCIES**: `book_versions`, `book-license` Edge Function
- **LOCAL STORAGE DEPENDENCIES**: `hscp.ts` (cache sandbox), `useStudyStore` (bookmarks, theme)
- **DESIGN QUALITY**: High (4 color themes: AMOLED, Sepia, Midnight, Light; moving watermark)
- **FUNCTIONAL QUALITY**: High (Screen capture prevention, background cache auto-clear, page jump)
- **KNOWN PROBLEMS**: Requires Expo Development Build for `react-native-pdf` binary module on physical device
- **RECOMMENDED PHASE**: Phase 05 (Native page-tile in-memory renderer)

### Formula Details (Modal)
- **ROUTE**: Rendered via `FormulaDetailModal` inside `/(tabs)/formulas` & `/(tabs)/index`
- **FILE**: `apps/mobile/components/FormulaDetailModal.tsx`
- **CURRENT STATUS**: WORKING
- **BACKEND DEPENDENCIES**: `formula_catalog`
- **LOCAL STORAGE DEPENDENCIES**: `useStudyStore` (favorites)
- **DESIGN QUALITY**: High (Equation hero box, SI unit table, copy LaTeX button)
- **FUNCTIONAL QUALITY**: High (Full variable breakdown & clipboard copy)
- **KNOWN PROBLEMS**: None
- **RECOMMENDED PHASE**: Phase 04

### Creative Question (CQ) Viewer (Modal)
- **ROUTE**: Rendered via `CQViewerModal` inside `/(tabs)/practice`
- **FILE**: `apps/mobile/components/CQViewerModal.tsx`
- **CURRENT STATUS**: WORKING
- **BACKEND DEPENDENCIES**: `content_packs`
- **LOCAL STORAGE DEPENDENCIES**: None
- **DESIGN QUALITY**: High (Stimulus box, sub-question accordion, mark distribution)
- **FUNCTIONAL QUALITY**: High (Collapsible solutions with step-by-step marking rubrics)
- **KNOWN PROBLEMS**: None
- **RECOMMENDED PHASE**: Phase 04

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
