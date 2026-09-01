# Visual Chapter & Page Map Editor Guide

The Visual Chapter & Page Map Editor allows operators to visually inspect PDF pages, adjust section boundaries, split/merge chapters, and publish non-destructive revisions.

---

## 1. 3-Pane Layout

The editor provides three synchronized panes:

```
┌─────────────────┬───────────────────────────────┬────────────────────────────────┐
│  1. PAGE RAIL   │   2. AUTHENTICATED PREVIEW    │      3. CHAPTER EDITOR         │
│  (Left Column)  │       (Center Column)         │        (Right Column)          │
│                 │                               │                                │
│ [Page 1]        │ Selected: Page 90             │ Mapped Chapters (12)           │
│ [Page 2]        │ OCR Confidence: 96%           │                                │
│ [Page 3]        │                               │ #1 Vectors (p.1-40)            │
│ ...             │ Extracted text preview...     │ #2 Dynamics (p.41-90)          │
│ [Page 90] ●     │                               │    [Split]  [Merge]  [Delete]  │
│                 │ [Set Chapter Start]           │                                │
└─────────────────┴───────────────────────────────┴────────────────────────────────┘
```

1. **Page Rail (Left)**: Virtualized thumbnail/page index for jumping directly to any page in the book. Indicator dots highlight existing chapter start pages.
2. **Page Preview & OCR Inspector (Center)**: Authenticated preview showing extracted text and OCR confidence score. Useful for verifying section headings and content.
3. **Chapter Editor (Right)**: Editable list of chapters with title, start page, and end page inputs, along with Split, Merge, and Delete actions.

---

## 2. Key Operations

### 2.1 Split Chapter at Page
When a large chapter needs to be split into two sub-topics:
1. Click **Split** on the chapter card.
2. Enter the split start page for the second half.
3. The system adjusts the end page of the first section to `splitPage - 1` and creates the second section starting at `splitPage`.

### 2.2 Merge Chapters
When two adjacent sections belong together:
1. Click **Merge** on the first chapter card.
2. Confirm the merge in the prompt.
3. The system combines titles and extends the end page to cover the second chapter's range.

### 2.3 Auto-Calculate End Pages
If end pages are omitted, the system automatically sets each chapter's end page to `nextChapter.start_page - 1`.

### 2.4 Overlap & Gap Warnings
- **Overlap Warning**: Displays when Chapter N's end page is greater than or equal to Chapter N+1's start page.
- **Gap Warning**: Displays when unmapped pages exist between sections (e.g. Pages 51–59 unmapped).

---

## 3. Non-Destructive Revisions

Saving a chapter map does not destroy previous mappings:
- Every save creates a new `BookChapterRevision` record with an incremented `revision_number`.
- The previous active revision is marked `SUPERSEDED`.
- Operators can inspect and restore older revisions from the History tab at any time.
