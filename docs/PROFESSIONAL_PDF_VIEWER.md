# HSC Study Platform — Professional PDF Viewer Architecture

## 1. Executive Summary

The **HSC Study Platform Professional PDF Viewer** is a high-performance, security-hardened, and educationally optimized PDF reading engine built directly into the mobile client (`apps/mobile/src/features/reader/`).

It delivers the fluidity and gesture precision of modern commercial readers (Adobe Acrobat, Google Drive PDF Viewer, Xodo, Kindle) while adhering strictly to the **HSCP (HSC Content Protection) zero-leakage security model** and addressing the specific needs of Bangladeshi HSC students studying complex bilingual (Bengali & English) textbooks with mathematical formulas, board questions, and multi-chapter curricula.

---

## 2. Architectural Principles

1. **Zero Raw PDF Exposure**:
   - Decrypted PDF files exist only temporarily in transient app-private cache directories (`Paths.cache`).
   - Plaintext files are automatically deleted upon screen exit, app backgrounding, or logout.
   - Screen capture and recording deterrence is enforced natively on Android/iOS.

2. **Clean, Unobtrusive Full-Screen Immersion**:
   - Toolbars float transparently above the canvas and auto-hide.
   - Single tap on the canvas toggles the top and bottom navigation bars.
   - Reading progress is scrubbed smoothly without flooding storage writes (persisted only upon drag release).

3. **Isolated Study Annotations**:
   - Bookmarks and personal notes are stored locally in SQLite (`local_progress`, `bookmarks`, `notes`) and synced in the background.
   - The underlying encrypted textbook container remains immutable and byte-accurate.

4. **Bilingual Search & Unicode Normalization**:
   - Unicode NFKC normalization ensures reliable searching of Bengali text, conjuncts, diacritics, and English scientific terms.

---

## 3. Component Hierarchy & Module Breakdown

```
apps/mobile/src/features/reader/
├── screens/
│   ├── SecurePdfViewerScreen.tsx     # Primary production viewer screen
│   └── SecureReaderScreen.tsx        # Backward-compatible alias
├── components/
│   ├── ReaderTopBar.tsx              # Translucent top bar with back, return jump, title, bookmark & tools
│   ├── ReaderBottomBar.tsx           # Scrubber, chapter drawer, thumbnail grid, jump trigger, themes
│   ├── ReaderPageView.tsx            # PDF canvas wrapping native engine with filter & dim overlays
│   ├── ReaderPageCounter.tsx         # '147 / 612' pill button triggering direct page jump
│   ├── ReaderProgressBar.tsx         # Drag-to-scrub slider committing on finger release
│   ├── ReaderChapterSheet.tsx        # TOC & canonical/non-canonical section navigator with progress %
│   ├── ReaderThumbnailSheet.tsx      # Virtualized page thumbnail grid with bookmarks & highlights
│   ├── ReaderSearchSheet.tsx         # Debounced search with Bengali/English fuzzy matching & snippets
│   ├── ReaderBookmarksSheet.tsx      # Chronological/Page-ordered bookmarks with fast delete
│   ├── ReaderNotesSheet.tsx          # Page-bound study notes editor and repository viewer
│   ├── ReaderAppearanceSheet.tsx     # 4 palettes (Original, Sepia, Dark, Midnight), scroll mode, dimming
│   ├── ReaderMoreSheet.tsx           # Reader information, package security details, shortcuts
│   ├── ReaderPageJumpSheet.tsx       # Direct numeric page input and ±10 page jump stepping
│   ├── ReaderContextSheet.tsx        # Linked formulas (LaTeX) and board Creative Questions (CQ)
│   ├── ReaderWatermark.tsx           # Dynamic non-intrusive watermark with non-sensitive session hash
│   ├── ReaderOfflineBadge.tsx        # Airplane-mode / offline package indicator
│   ├── ReaderSyncIndicator.tsx       # Cloud reading progress sync status badge
│   ├── ReaderSkeleton.tsx            # HSCP sandbox initialization placeholder
│   └── ReaderErrorState.tsx          # Resilient error boundary with clear retry workflows
├── hooks/
│   ├── useReaderController.ts        # Unified controller abstraction (goToPage, jumps, controls, themes)
│   ├── useReaderProgress.ts          # Page state, release-only debounced persistence & progress math
│   ├── useReaderBookmarks.ts         # Local-first bookmark toggle and deduplication
│   ├── useReaderNotes.ts             # Page-bound notes CRUD
│   ├── useReaderSearch.ts            # Debounced bilingual search hook
│   ├── useReaderSettings.ts          # User preferences persistence (palettes, direction, dimming)
│   ├── useReaderSecurity.ts          # Session ID generation and screen capture hook
│   └── useReaderLifecycle.ts         # Android hardware back button and AppState background flush
├── security/
│   ├── readerLaunchResolver.ts       # Validates launch requests (offline-hscp, online-protected, demo, blocked)
│   ├── protectedReaderSession.ts     # Session lifecycle manager and temp cache teardown
│   ├── packageIntegrity.ts           # AES-256-GCM auth tag and header structure validation
│   ├── plaintextLifecycle.ts         # Transient cache decryptor and auto-cleanup
│   └── screenCapture.ts              # Native screen recording & screenshot blocker
├── data/
│   ├── reader.repository.ts          # Textbook metadata and fallback fixture provider
│   ├── progress.repository.ts        # SQLite reading progress read/write
│   ├── bookmarks.repository.ts       # Local SQLite bookmarks storage
│   └── notes.repository.ts           # Local SQLite notes storage
├── utils/
│   ├── chapterLookup.ts              # Sorted range lookup and section classifier
│   ├── pageNavigation.ts             # Location history stack for return jumps
│   ├── readerTheme.ts                # Palette tokens, contrast ratios, and filter overlays
│   └── searchNormalization.ts        # Bengali Unicode normalizer and snippet extractor
└── types/
    └── reader.types.ts               # Domain models, controller interfaces, and session state
```

---

## 4. Reading Features & Navigation

### 4.1 Page Navigation & History
- **Direct Paging**: Next / Previous buttons, continuous vertical scroll, or horizontal page flipping.
- **Scrubber**: Dragging previews the target page without hammering SQLite/cloud writes; progress commits only on touch release.
- **Location History Stack**: Clicking a formula or search result navigates to that page and displays a floating **"Return"** pill on the top bar, allowing instant one-tap return to the previous study position.
- **Direct Jump Dialog**: Tap the `147 / 612` badge or open the jump sheet to input any page number with `±10`, `First (1)`, or `Last (N)` shortcuts.

### 4.2 Chapter Index & Progress Tracking
- **Canonical & Non-Canonical Sections**: Recognizes standard chapters, prefaces, tables of contents, appendices, and index sections.
- **Per-Chapter Progress**: Calculates reading percentage within each individual chapter (`startPage <= currentPage <= endPage`).
- **Quick Filtering**: Instant real-time search within chapter titles in Bengali and English.

### 4.3 Full-Text & Concept Search
- **Unicode NFKC Normalization**: Strips zero-width characters and normalizes Bengali diacritics.
- **Debounced Execution**: Queries execute after a 250ms quiet period.
- **Contextual Excerpts**: Generates 100-character snippets centered around the matching term.
- **Concept Shortcuts**: Detects queries like `"formula"`, `"সূত্র"`, `"CQ"`, or `"সৃজনশীল"` and jumps directly to key chapter landmarks.

### 4.4 Bookmarks & Isolated Notes
- **Local-First**: Bookmarks and notes are immediately written to local SQLite and cached in memory.
- **Deduplication**: Toggling a bookmark on an existing page deletes it; toggling on an unmarked page creates a new bookmark.
- **Page Binding**: Notes are bound to the specific page and chapter without modifying the underlying textbook binary.

### 4.5 Display Themes & Eye Comfort
- **Four Palettes**:
  - `Original (Day)`: Crisp white background for bright environments.
  - `Sepia (Warm Paper)`: Relaxing `#F6EFE6` tone with diagram-safe color filtering for daylight reading.
  - `Dark (AMOLED)`: Deep black `#04070A` chrome with soft page contrast for battery saving and night study.
  - `Midnight (Deep Blue)`: Calm `#050B12` blue-tinted theme.
- **In-App Dimming**: Provides 100%, 80%, and 60% software dimming layers without altering system brightness or distorting diagrams.
- **Keep Screen Awake**: Optional wake lock toggle for long reading sessions.

---

## 5. Security & HSCP Compliance

- **Deterrence Watermark**: Subtle floating text `HSC STUDY • S:<HEX>` cycling quadrants based on `pageNumber % 4`. Never includes PII (no passwords, emails, phone numbers, or tokens).
- **Transient Memory Lifecycle**: AES-256-GCM chunks are decrypted into app-private cache on demand and purged immediately on screen unmount or app minimize.
- **Zero Route Leakage**: Route parameters only carry `bookId`, `versionId`, and `initialPage`—never Drive URLs, tokens, or encryption keys.
