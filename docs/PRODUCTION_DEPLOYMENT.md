# Production Deployment & Operations Guide

This guide provides the complete, step-by-step instructions for deploying the HSC Study Platform into a production environment.

---

## 1. Production Architecture Summary

```
                       ┌──────────────────────────────────────┐
                       │  Student Mobile App (Expo / Android)  │
                       └──────────────────┬───────────────────┘
                                          │ HTTPS
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
      ┌─────────────────────────────┐           ┌─────────────────────────────┐
      │  Supabase Cloud (PostgreSQL │           │   Admin Studio (Next.js)    │
      │   + Auth + RLS + Functions) │           │   (Node.js / Docker / VPS)  │
      └──────────────┬──────────────┘           └──────────────┬──────────────┘
                     │                                         │
                     │ Service Role                            │ HTTP / API
                     ▼                                         ▼
      ┌───────────────────────────────────────────────────────────────────────┐
      │               Python Content Factory Worker (VPS / VM)                │
      │   - Streaming AES-256-GCM HSCP Packager & Key Wrapper                │
      │   - SQLite FTS5 Full-Text Search Pack Generator                       │
      │   - Autonomous Drive Inbox & Local Ingestion Engines                  │
      └──────────────────────────────────┬────────────────────────────────────┘
                                         │
                                         ▼
                     ┌──────────────────────────────────────┐
                     │ Google Drive 5TB Private Warehouse   │
                     │ (Optional Cloudflare R2 Edge Cache)  │
                     └──────────────────────────────────────┘
```

---

## 2. Step-by-Step Initial Deployment Order

### Step 1: Provision Supabase Project
1. Create a new project in [Supabase Dashboard](https://app.supabase.com).
2. Note the Project URL (`https://xyz.supabase.co`), `anon` publishable key, and `service_role` secret key.
3. Configure Auth Settings:
   - Enable Email / Password Provider.
   - Disable automatic email confirmation if testing instant onboarding.

### Step 2: Apply Database Migrations (In Sequential Order)
Run migrations in sequential order using the Supabase CLI or SQL Editor:
```bash
supabase db push
# Or apply sequentially in SQL Editor:
# 1. 0001_init.sql
# 2. 0002_auth_profile_trigger.sql
# 3. 0003_onboarding_atomic_rpc.sql
# 4. 0004_subject_explorer_indexes.sql
# 5. 0005_library_catalog_indexes.sql
# 6. 0006_book_details_indexes.sql
# 7. 0007_formula_hub_indexes.sql
# 8. 0008_cq_catalog_indexes.sql
# 9. 0009_pdf_platform_and_rights.sql
# 10. 0010_content_factory_bulk_import.sql
# 11. 0011_book_cms_and_versioning.sql
```

### Step 3: Deploy Supabase Edge Functions
Deploy the server-side license verification function:
```bash
supabase functions deploy book-license --no-verify-jwt
supabase secrets set CONTENT_MASTER_KEY_B64="<YOUR_32_BYTE_BASE64_KEY>"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<YOUR_SERVICE_ROLE_KEY>"
```

### Step 4: Configure Google Drive Origin Warehouse
1. In Google Cloud Console, create OAuth 2.0 Client Credentials (Desktop/Web).
2. Generate Refresh Token with `https://www.googleapis.com/auth/drive` scope.
3. Create root warehouse directory in Google Drive:
   - `00_INBOX` (Incoming PDF inbox)
   - `10_ORIGINALS` (Archived source PDFs)
   - `20_SECURE_BOOKS` (Encrypted `.hscp` containers)
   - `30_SEARCH_PACKS` (FTS5 search indexes)
   - `50_COVERS` (Cover webp/png assets)
4. Note the Root Folder ID.

### Step 5: Deploy Content Factory Worker (Docker / VM)
1. Provision a Linux VM / Server (2+ vCPU, 4GB+ RAM, 100GB SSD).
2. Configure `services/worker/.env`:
   ```bash
   STORAGE_PROVIDER=drive
   GOOGLE_CLIENT_ID="<YOUR_CLIENT_ID>"
   GOOGLE_CLIENT_SECRET="<YOUR_CLIENT_SECRET>"
   GOOGLE_REFRESH_TOKEN="<YOUR_REFRESH_TOKEN>"
   GOOGLE_DRIVE_FOLDER_ID="<ROOT_FOLDER_ID>"
   SUPABASE_URL="https://xyz.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="<SERVICE_ROLE_KEY>"
   CONTENT_MASTER_KEY_B64="<YOUR_32_BYTE_BASE64_KEY>"
   CONTENT_MASTER_KEY_VERSION=1
   CORS_ORIGINS="https://admin.yourdomain.com"
   WORKER_CONCURRENCY=2
   ```
3. Start the worker container:
   ```bash
   docker build -t hsc-worker ./services/worker
   docker run -d --name hsc-worker --restart unless-stopped \
     -p 8787:8787 \
     --env-file ./services/worker/.env \
     -v /var/data/hsc_worker:/data \
     hsc-worker
   ```
4. Verify health: `curl -f http://localhost:8787/health`.

### Step 6: Deploy Admin Studio (Next.js)
1. Configure `apps/admin/.env.local`:
   ```bash
   NEXT_PUBLIC_INGEST_API_URL=https://api-worker.yourdomain.com
   NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
   ```
2. Build & run production container:
   ```bash
   docker build -f apps/admin/Dockerfile -t hsc-admin .
   docker run -d --name hsc-admin --restart unless-stopped \
     -p 3000:3000 \
     --env-file apps/admin/.env.local \
     hsc-admin
   ```

### Step 7: Build Android Production App
1. Configure `apps/mobile/.env`:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
   EXPO_PUBLIC_LICENSE_FUNCTION_URL=https://xyz.supabase.co/functions/v1/book-license
   EXPO_PUBLIC_DEMO_MODE=false
   ```
2. Verify Expo configuration: `npx expo config --type public`.
3. Build Android App Bundle (AAB) or APK:
   ```bash
   cd apps/mobile
   eas build --platform android --profile production
   ```

---

## 3. Production Health Monitoring & Alerts

- Worker Health: Monitor `GET /health` every 30 seconds.
- Storage Health: Quality dashboard at `/quality` monitors missing covers, unmapped chapters, search failures, and broken HSCP packages.
- Crash Leases: Worker automatically reclaims leases older than 120s upon restart.
