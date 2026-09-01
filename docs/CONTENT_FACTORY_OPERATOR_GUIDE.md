# Content Factory Operator Guide

This guide provides end-to-end instructions for operating the HSC Study Platform Autonomous Content Factory in production and local development modes.

---

## 1. Fast Start: Starting the Content Factory Worker

### Prerequisites
- Node.js 20+
- Python 3.12+ (with `fitz` PyMuPDF, `fastapi`, `uvicorn`, `cryptography`, `pydantic-settings`)
- Supabase (cloud or local instance) or Local SQLite fallback

### Starting the Worker Daemon
```bash
cd services/worker
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -e .
uvicorn app.api:app --host 0.0.0.0 --port 8787 --reload
```

---

## 2. Ingesting Textbooks

### Method A: Web Admin Mass Ingestion Studio
1. Open the Admin UI at `http://localhost:3000/imports/bulk`.
2. Choose your source tab:
   - **Upload Multiple PDFs**: Drag and drop 10 to 100+ PDF textbooks. Files stream directly in 8 MB chunks.
   - **Google Drive 00_INBOX**: Click **Scan Drive Inbox Now** to discover newly deposited files and enqueue import jobs.
   - **Local Folder Discovery**: Enter the directory path on the host machine (e.g. `D:\HSC Books`) and click **Scan Folder**.
3. The queue table will automatically show processing stages: `quick_scan` -> `structure` -> `origin_upload` -> `cover` -> `pack` -> `search` -> `ready_for_review`.

### Method B: CLI Bulk Importer
Run the bulk folder import CLI script:
```bash
python services/worker/scripts/import_folder.py "D:/HSC Books" \
  --recursive \
  --group-name "NCTB 2026 Batch" \
  --priority HIGH \
  --rights-status LICENSED \
  --allow-distribution
```

---

## 3. Reviewing & Publishing Books

1. Navigate to `/review` or click **Open Review Queue** on the dashboard.
2. **Keyboard Shortcuts**:
   - `J` or `→`: Next book
   - `K` or `←`: Previous book
   - `A`: Approve draft and advance to next item
   - `S`: Save current edits
3. **Verify Metadata**:
   - Confirm detected Subject (e.g., Physics, Chemistry, Higher Math, Biology, ICT) and Paper (1 or 2).
   - Switch Cover Page Candidate (Page 1, 2, or 3) if cover art is located after the initial blank leaf.
   - Confirm Rights Status (`LICENSED`, `OWNED`, `PUBLIC_DOMAIN`, etc.).
4. **Publishing**:
   - **Single Publish**: Click **Publish Book Now**.
   - **Bulk Publish**: Click **Validate All for Publishing** to run a dry-run check, then click **Publish Ready Books**.

---

## 4. Rights & Licensing Guard Rules

> [!IMPORTANT]
> The Content Factory strictly refuses to publish any book with `rights_status = "UNVERIFIED"` or `distribution_allowed = false`.
> Filenames (e.g., "Udvash.pdf" or "NCTB.pdf") do NOT grant copyright clearance. Explicit admin verification is mandatory.
