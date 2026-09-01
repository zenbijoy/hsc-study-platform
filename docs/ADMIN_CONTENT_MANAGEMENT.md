# Admin Content Management Guide

This guide describes the standard operational workflow for managing textbooks, chapter mappings, versions, legal rights, and mobile catalog releases in the HSC Study Platform.

---

## 1. Overview & Information Architecture

The Admin Studio provides a unified management center across the following core routes:

- `/books`: Book Catalog Manager (paginated search, filtering, and bulk operations).
- `/books/[bookId]`: Single Book Studio (11 functional tabs: Overview, Metadata, Cover, Chapters, Versions, Reader, Rights, Relationships, Issues, History, Mobile Preview).
- `/publishing`: Publishing Console (Ready to Publish, Blocked, Published, and Update views).
- `/quality`: Content Quality Dashboard (widgets for missing covers, unmapped chapters, broken packages, search errors, and open student reports).
- `/imports/bulk`: Mass Ingestion Studio (local folder discovery & Drive inbox batch imports).
- `/review`: Ingestion Review Queue.

---

## 2. Standard Book Lifecycle Workflow

### Step 1: Open Book in Catalog
Navigate to `/books`. Use the search bar or filters (Subject, Paper, Status, Rights) to locate the textbook. Click **Manage Book**.

### Step 2: Fix & Lock Metadata
Navigate to the **Metadata** tab.
1. Review Title, Subtitle, Subject, Paper, Publisher, Edition, and Description.
2. Edit any required fields.
3. Click **Save Metadata**.
4. The system tags edited fields with `source=ADMIN_OVERRIDE` and sets `metadata_locked_by_admin=true`. Future automated reprocessing pipelines will not overwrite these fields.

### Step 3: Select or Upload Cover
Navigate to the **Cover** tab.
1. Review auto-detected candidates from Pages 1–3.
2. Click a candidate to preview or paste a custom authorized cover asset URL.
3. Click **Update Cover**.

### Step 4: Correct Chapter Boundaries
Navigate to the **Chapters & Pages** tab.
1. The **Page Rail** on the left allows quick navigation across pages.
2. The **Center Pane** shows authenticated page text and OCR confidence.
3. The **Right Pane** allows editing chapter titles, start pages, and end pages.
4. Use **Split Chapter** to divide large chapters at a specific page.
5. Use **Merge** to combine adjacent sections.
6. Click **Save Chapter Revision** to save a non-destructive revision.

### Step 5: Configure Access & Legal Rights
Navigate to the **Access & Rights** tab.
1. Set the **Rights Status** (`LICENSED`, `OWNED`, `OPEN_LICENSE`, `PUBLIC_DOMAIN`, `PUBLISHER_AUTHORIZED`).
2. Verify **Allow Student Distribution** is enabled.
3. Configure online streaming and offline encrypted download policies.
4. Click **Save Rights Policy**.

### Step 6: Validate & Preview Mobile View
1. Navigate to the **Mobile Preview** tab to inspect how the Library Card, Book Details Screen, and Reader Drawer appear with draft data.
2. Review the **Book Health Matrix** on the Overview tab to ensure zero publication blockers.

### Step 7: Publish to Mobile App
Click **Publish to App** in the header.
1. The system validates all quality gates.
2. Promotes the version atomically.
3. The textbook is immediately available to students in the mobile app.

---

## 3. Uploading New Editions & Version Updates

1. Upload the new PDF via Mass Ingestion or Single PDF Studio.
2. In the Book Studio, navigate to the **Versions** tab.
3. Compare the new version side-by-side with the active version (metadata diff, chapter additions/removals, page count deltas).
4. Click **Publish Version**.
5. Existing downloaded students will see an **Update Available** badge in their app without losing their current offline access.

---

## 4. Rollback Workflow

If a published version has an unexpected error:
1. Navigate to `/books/[bookId]?tab=versions`.
2. Find the previous working version (e.g. `v1`).
3. Click **Rollback to v1**.
4. Enter an operational reason.
5. The active pointer is switched atomically with zero downtime and full audit logging.
