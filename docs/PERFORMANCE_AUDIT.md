# Mobile Performance & Optimization Audit

**Target Platform**: Android (Physical devices & Emulators) + iOS  
**Severity Scale**: P0 (Catastrophic) · P1 (Serious) · P2 (Moderate) · P3 (Minor)

---

## 1. List Virtualization & Rendering Analysis

| Screen / Component | Current Implementation | Severity | Finding & Recommendation |
| :--- | :--- | :--- | :--- |
| **Library List** | `@shopify/flash-list` | **OPTIMIZED** | Uses FlashList with recycled view cells. No unbounded list rendering. |
| **Formula Vault** | `@shopify/flash-list` | **OPTIMIZED** | Uses FlashList with memoized filtering. |
| **Home Screen Subjects** | `.map()` over 4 subjects | **P3 (Minor)** | Safe because HSC group subjects are strictly bounded (4–8 items max). |
| **Book Details Chapters** | `.map()` over top 5 chapters | **P3 (Minor)** | Safe bounded slice. Full index opens inside `ChapterListModal`. |
| **Practice Screen CQs** | ScrollView over sample CQs | **P2 (Moderate)** | For production libraries containing hundreds of CQs, practice tab should paginate via FlashList. |

---

## 2. Network & Query Optimization

| Pattern | Status | Finding |
| :--- | :--- | :--- |
| **Query Client Caching** | **VERIFIED** | TanStack Query (`queryClient`) caches subjects, books, and formulas. No repetitive network spam on tab switching. |
| **Per-Card Network Calls** | **ZERO** | Components (`BookCard`, `FormulaCard`, `SubjectCard`) are purely data-driven from parent query results. Zero database requests are fired per card. |
| **Formula LaTeX Overhead** | **OPTIMIZED** | Formulas use Unicode plain-text representations for list scrolling, reserving deep LaTeX parsing for modal inspection. |

---

## 3. Native & Memory Footprint

| Subsystem | Finding | Severity |
| :--- | :--- | :--- |
| **PDF Memory Handling** | `react-native-pdf` consumes memory only during active reading. Temporary cache files are deleted on unmount. | **OPTIMIZED** |
| **Zustand State Footprint** | Local store holds bookmarks, streaks, and quiz history. Byte footprint is < 50 KB. | **OPTIMIZED** |
| **Watermark Animation** | Uses simple CSS/layout floating positioning without heavy JavaScript frame loops that would drop scroll FPS. | **OPTIMIZED** |
