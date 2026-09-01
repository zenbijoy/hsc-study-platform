# Admin Studio Screen & Feature Inventory

**Framework Baseline**: Next.js 16.3 Active LTS · React 19.2 · Tailwind CSS v3 · Lucide Icons · Supabase SSR

---

## 1. Feature & Screen Inventory

| Logical Area | Screen / Component | Status | Location / Implementation Details |
| :--- | :--- | :--- | :--- |
| **Dashboard** | Overview Dashboard | **COMPLETE** | `apps/admin/app/page.tsx` (KPI cards: Origin Storage, Database Role, Ingestion, Reader Delivery, Architecture Principles) |
| **PDF Import** | Intelligent File Dropzone | **COMPLETE** | `apps/admin/components/UploadStudio.tsx` (Accepts PDF, TXT, MD, JSONL, CSV; progress bar; stages file to worker `/v1/imports/upload`) |
| **AI / JSONL Import** | AI JSONL Generator Tab | **COMPLETE** | `apps/admin/components/UploadStudio.tsx` (Direct text payload input matching `schemas/content-item.schema.json`, sample batch prefill, posts to `/v1/imports/text`) |
| **Bulk Import** | Streaming Bulk Import | **PARTIAL** | Backend streaming staging is implemented via SQLite disk staging; Admin UI handles multi-MB uploads via standard upload pipeline. |
| **Processing Queue** | Live Pipeline Monitor | **COMPLETE** | `apps/admin/components/UploadStudio.tsx` (Realtime job polling `/v1/imports/{id}`, progress percentage, stage indicator, chapter/formula/CQ counts) |
| **Publishing Review** | Publication Review & Gate | **COMPLETE** | `apps/admin/components/UploadStudio.tsx` (Rights confirmation checkbox gate, 1-click atomic publish trigger via `/v1/imports/{id}/publish`) |
| **Formula Studio** | Standalone Formula Editor | **PLACEHOLDER** | Integrated inside UploadStudio AI text ingestion; dedicated visual formula math editor with live KaTeX preview is planned for Phase 06. |
| **CQ / MCQ Studio** | Standalone Question Studio | **PLACEHOLDER** | Handled through structured JSONL ingestion in UploadStudio; dedicated manual rich text editor planned for Phase 06. |
| **Duplicate Review** | Low-Confidence Review | **PARTIAL** | Backend produces `review_samples` with RapidFuzz deduplication scores; Admin UI displays aggregate counts and validates before publish. |
| **Version Rollback** | Rollback Manager | **PARTIAL** | Database supports pointer switching on `books.published_version_id`; dedicated rollback button UI planned for Phase 06. |
| **Storage Analytics** | Warehouse Inspector | **COMPLETE** | Summary KPI cards on `apps/admin/app/page.tsx` showing Google Drive origin and local warehouse stats. |
| **Settings / RBAC** | Staff Access & Security | **PARTIAL** | Basic environment configuration; Staff Zero-Trust Auth gate planned for production deployment. |

---

## 2. Admin UI / Worker API Integration

```text
UploadStudio (Browser)
      │
      ├─ POST /v1/imports/upload (Multipart form data: PDF / TXT / JSONL / CSV)
      ├─ POST /v1/imports/text   (JSON payload: AI-generated JSONL)
      ├─ GET  /v1/imports/{id}   (Polling progress every 900ms)
      └─ POST /v1/imports/{id}/publish (Atomic publish with rights confirmation)
```
