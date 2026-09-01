# HSC Study Platform — PDF Viewer Feature Matrix

| Feature Domain | Capability | Implementation Status | Technical Location |
| :--- | :--- | :--- | :--- |
| **Paging & Navigation** | Continuous Vertical Scrolling | ✅ Fully Supported | `ReaderPageView.tsx` |
| | Horizontal Page Paging / Flipping | ✅ Fully Supported | `ReaderPageView.tsx` |
| | Page Clamping (1..N) | ✅ Fully Supported | `utils/pageNavigation.ts` |
| | Scrubber (Drag preview, release persist) | ✅ Fully Supported | `components/ReaderProgressBar.tsx` |
| | Jump to Page (Direct Input, ±10, First/Last) | ✅ Fully Supported | `components/ReaderPageJumpSheet.tsx` |
| | Navigation History (Return to previous page) | ✅ Fully Supported | `utils/pageNavigation.ts` |
| **Table of Contents** | Canonical & Non-Canonical Section Parsing | ✅ Fully Supported | `utils/chapterLookup.ts` |
| | Chapter Reading Progress Percentage | ✅ Fully Supported | `utils/chapterLookup.ts` |
| | In-Chapter Real-Time Filter | ✅ Fully Supported | `components/ReaderChapterSheet.tsx` |
| | Fast Jump to Chapter Start Page | ✅ Fully Supported | `components/ReaderChapterSheet.tsx` |
| **Search & Discovery** | Bengali Unicode NFKC Normalization | ✅ Fully Supported | `utils/searchNormalization.ts` |
| | English & Bilingual Search | ✅ Fully Supported | `utils/searchNormalization.ts` |
| | Debounced Query Execution (250ms) | ✅ Fully Supported | `hooks/useReaderSearch.ts` |
| | Contextual Excerpt Snippets (100-char) | ✅ Fully Supported | `utils/searchNormalization.ts` |
| | Landmark Fallback (Formulas, CQs, Theorems) | ✅ Fully Supported | `components/ReaderSearchSheet.tsx` |
| **Annotations & Study** | Local SQLite Bookmarks Storage | ✅ Fully Supported | `data/bookmarks.repository.ts` |
| | Bookmark Toggle & Deduplication | ✅ Fully Supported | `hooks/useReaderBookmarks.ts` |
| | Personal Page Notes CRUD | ✅ Fully Supported | `data/notes.repository.ts` |
| | Zero Modification to Underlying PDF | ✅ Fully Supported | Native immutable HSCP design |
| | Freehand Pen/Ink Drawing on Protected PDF | ⏳ Deferred (V2 Roadmap) | Requires vector overlay layer |
| **Display & Comfort** | 4 Palettes (Original, Sepia, Dark, Midnight) | ✅ Fully Supported | `utils/readerTheme.ts` |
| | Eye Comfort Diagram-Safe Filter Layer | ✅ Fully Supported | `components/ReaderPageView.tsx` |
| | In-App Dimming Layer (100%, 80%, 60%) | ✅ Fully Supported | `components/ReaderPageView.tsx` |
| | Keep Screen Awake Wake-Lock Toggle | ✅ Fully Supported | `hooks/useReaderSettings.ts` |
| | Auto-Hiding Floating Toolbars | ✅ Fully Supported | `hooks/useReaderController.ts` |
| **Security & HSCP** | AES-256-GCM Cryptographic Chunk Decryption | ✅ Fully Supported | `lib/hscp.ts` |
| | Transient Decrypted File Auto-Purge | ✅ Fully Supported | `security/plaintextLifecycle.ts` |
| | Background / Minimize Auto-Cleanup | ✅ Fully Supported | `hooks/useReaderLifecycle.ts` |
| | Screen Capture & Recording Deterrence | ✅ Fully Supported | `security/screenCapture.ts` |
| | Dynamic Non-PII Session Watermark | ✅ Fully Supported | `components/ReaderWatermark.tsx` |
| | Zero Sensitive Route Tokens / Parameters | ✅ Fully Supported | `security/readerLaunchResolver.ts` |
| **Offline & Reliability**| Resumable HSCP Package Download | ✅ Fully Supported | `lib/download.ts` |
| | Offline License Verification & Key Caching | ✅ Fully Supported | `lib/license.ts` |
| | Local SQLite Reading Progress Sync | ✅ Fully Supported | `lib/localDb.ts`, `lib/progress.ts` |
| | Resilient Error Boundary & Retry Actions | ✅ Fully Supported | `components/ReaderErrorState.tsx` |
| | Skeleton Sandbox Loading Placeholder | ✅ Fully Supported | `components/ReaderSkeleton.tsx` |
