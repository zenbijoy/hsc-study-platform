# Admin PDF Upload & Publishing Guide

**Specification**: `docs/ADMIN_PDF_UPLOAD.md`  
**Target Route**: `apps/admin/app/books/import/page.tsx` (`/books/import`)  

---

## 1. Step-by-Step Upload Workflow

1. **Navigate to Upload Studio**:
   - Open Admin app at `http://localhost:3000/books/import`.
2. **Select or Drop PDF**:
   - Drag & drop a PDF textbook (e.g. `HSC_Physics_1st_Paper.pdf`).
   - The browser streams 8 MB chunks via resumable upload session (`/v1/uploads/pdf/session`).
3. **Automated Worker Pipeline**:
   - The Content Factory worker extracts metadata, renders the cover thumbnail, detects the subject/paper, and maps table of contents into chapter page ranges.
   - An encrypted HSCP package is generated (`20_SECURE_BOOKS/<book_id>/v1.hscp`).
4. **Admin Review & Edits**:
   - Verify detected Title, Subject, Paper, Publisher.
   - Review the Chapter Map (start/end pages).
   - Set **Rights Status** (e.g., `LICENSED`, `OPEN_LICENSE`, `PUBLIC_DOMAIN`).
5. **Atomic Publish**:
   - Check the rights confirmation box and click **Publish Book to Mobile Catalog**.
   - The catalog pointer switches atomically. The book appears immediately in the student app.
