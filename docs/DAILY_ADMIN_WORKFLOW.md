# Daily Admin Operations & Standard Operating Procedures

This document outlines the standard daily operating procedures for platform operators managing textbooks and student content issues.

---

## 1. Routine Ingestion & Publication Flow

```
1. Discover & Upload
   ├── Place new textbooks in Google Drive 00_INBOX or upload via /imports/bulk
   └── Worker automatically ingests, generates cover candidates, extracts chapters, and encrypts HSCP
          │
2. Review Queue (/review)
   ├── Press J / K to navigate books
   ├── Select best cover from candidates 1-3
   ├── Correct title, subject, paper, and edition
   └── Press A to approve & advance
          │
3. Publishing Console (/publishing)
   ├── Inspect Ready to Publish list
   ├── Verify legal rights checkbox
   └── Click Publish Selected to release live to mobile app
```

---

## 2. Managing Content Issues & Student Reports

1. Navigate to `/quality` daily.
2. Review the **Content Issues & Error Reports** list.
3. For any report (e.g. "Wrong page boundary in Chapter 3"):
   - Click **Open Editor** to deep-link directly into the book's chapter editor.
   - Adjust chapter start/end page.
   - Click **Save Chapter Revision**.
   - Return to `/quality` and click **Resolve**.

---

## 3. Rebuilding Corrupted or Stale Artifacts

If the Quality Dashboard indicates missing search indexes or packages:
1. Navigate to `/books/[bookId]`.
2. Go to the **Reader & Security** tab.
3. Click **Rebuild Secure Package** or **Rebuild Search**.
4. The worker regenerates the candidate in the background and promotes it once verified.
