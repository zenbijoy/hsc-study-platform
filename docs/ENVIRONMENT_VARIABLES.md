# Project Environment Variables & Secrets Architecture

This document defines the strict classification, boundary isolation, and security policy for all environment variables across the HSC Study Platform.

---

## 1. Classification & Security Hierarchy

| Category | Boundary | Exposure Rule |
| :--- | :--- | :--- |
| **`PUBLIC_CLIENT`** | React Native (`EXPO_PUBLIC_*`) & Next.js (`NEXT_PUBLIC_*`) | Bundled into client JS. Must NEVER contain private keys, service-role keys, or OAuth secrets. |
| **`SERVER_ONLY`** | Supabase Edge Functions & Next.js Server Runtimes | Secure server-side secrets. Inaccessible to client browsers and mobile apps. |
| **`WORKER_ONLY`** | Python Content Factory (`services/worker`) | Private publisher server only. Must NEVER be exposed via anonymous public endpoints. |
| **`BUILD_TIME`** | CI/CD pipelines & EAS Build profiles | Used for application compilation and container building. |
| **`OPTIONAL`** | Fallback & dev toggles | Used for local demo modes and zero-credential offline fallbacks. |

---

## 2. Complete Environment Variables Matrix

### A. Mobile Application (`apps/mobile/.env`)

| Variable Name | Classification | Required? | Secret? | Format / Example | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `EXPO_PUBLIC_SUPABASE_URL` | `PUBLIC_CLIENT` | Yes (in Cloud) | No | `https://xyz.supabase.co` | Supabase API endpoint |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `PUBLIC_CLIENT` | Yes (in Cloud) | No | `sb_publishable_...` | Supabase anon/publishable key |
| `EXPO_PUBLIC_LICENSE_FUNCTION_URL` | `PUBLIC_CLIENT` | Yes (in Cloud) | No | `https://xyz.supabase.co/functions/v1/book-license` | Device license Edge Function URL |
| `EXPO_PUBLIC_DEMO_MODE` | `PUBLIC_CLIENT` | Optional | No | `true` or `false` | Enables local mock catalog when Supabase is unconfigured |

> [!CAUTION]
> **NEVER** add `SUPABASE_SERVICE_ROLE_KEY`, `CONTENT_MASTER_KEY_B64`, or Google Drive secrets to `apps/mobile/.env`.

---

### B. Admin Studio (`apps/admin/.env.local`)

| Variable Name | Classification | Required? | Secret? | Format / Example | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_INGEST_API_URL` | `PUBLIC_CLIENT` | Yes | No | `http://localhost:8787` | Content Factory worker endpoint |
| `NEXT_PUBLIC_SUPABASE_URL` | `PUBLIC_CLIENT` | Yes (in Cloud) | No | `https://xyz.supabase.co` | Supabase API endpoint for staff sessions |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `PUBLIC_CLIENT` | Yes (in Cloud) | No | `sb_publishable_...` | Supabase public key for browser client |

---

### C. Content Factory Worker (`services/worker/.env`)

| Variable Name | Classification | Required? | Secret? | Format / Example | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `STORAGE_PROVIDER` | `WORKER_ONLY` | Yes | No | `local`, `drive`, `r2` | Selected origin storage provider |
| `WAREHOUSE_DIR` | `WORKER_ONLY` | Yes (if local) | No | `./var/warehouse` | Local filesystem storage path |
| `INBOX_DIR` | `WORKER_ONLY` | Yes | No | `./var/inbox` | Temporary upload and staging path |
| `JOB_DB` | `WORKER_ONLY` | Yes | No | `./var/jobs.sqlite3` | SQLite persistent job queue path |
| `CORS_ORIGINS` | `WORKER_ONLY` | Yes | No | `http://localhost:3000` | Allowed web origins |
| `GOOGLE_CLIENT_ID` | `WORKER_ONLY` | Yes (if drive) | No | `...apps.googleusercontent.com`| Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `WORKER_ONLY` | Yes (if drive) | **YES** | `GOCSPX-...` | Google OAuth Client Secret |
| `GOOGLE_REFRESH_TOKEN` | `WORKER_ONLY` | Yes (if drive) | **YES** | `1//04...` | Google Drive 5TB Refresh Token |
| `GOOGLE_DRIVE_FOLDER_ID`| `WORKER_ONLY` | Yes (if drive) | No | `1A2B3C...` | Origin root warehouse folder ID |
| `GOOGLE_DRIVE_PUBLIC_PACKAGES` | `WORKER_ONLY` | Optional | No | `false` | Package access policy |
| `R2_ACCOUNT_ID` | `WORKER_ONLY` | Yes (if r2) | No | `hex_id` | Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | `WORKER_ONLY` | Yes (if r2) | No | `key_id` | Cloudflare R2 Access Key |
| `R2_SECRET_ACCESS_KEY` | `WORKER_ONLY` | Yes (if r2) | **YES** | `secret_key` | Cloudflare R2 Secret Access Key |
| `R2_BUCKET` | `WORKER_ONLY` | Yes (if r2) | No | `hsc-content-cache` | R2 Bucket Name |
| `SUPABASE_URL` | `WORKER_ONLY` | Yes (in Cloud) | No | `https://xyz.supabase.co` | Supabase API endpoint |
| `SUPABASE_SERVICE_ROLE_KEY` | `WORKER_ONLY` | Yes (in Cloud) | **YES** | `eyJhbGci...` | Supabase service-role key for server catalog upsert |
| `CONTENT_MASTER_KEY_B64` | `WORKER_ONLY` | Yes (in Cloud) | **YES** | 32-byte base64 string | Server master key for wrapping book content keys |
| `CONTENT_MASTER_KEY_VERSION` | `WORKER_ONLY` | Yes | No | `1` | Master key rotation version identifier |
| `DEFAULT_CHUNK_SIZE` | `WORKER_ONLY` | Optional | No | `4194304` (4 MB) | AES-256-GCM chunk split boundary |
| `MAX_UPLOAD_BYTES` | `WORKER_ONLY` | Optional | No | `2147483648` (2 GB) | Upload file limit |
| `WORKER_CONCURRENCY` | `WORKER_ONLY` | Optional | No | `2` | Worker thread pool slots |

---

### D. Supabase Edge Functions (`supabase/functions/book-license`)

| Variable Name | Classification | Required? | Secret? | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `SUPABASE_URL` | `SERVER_ONLY` | Yes | No | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `SERVER_ONLY` | Yes | **YES** | Server-side user and secret table query |
| `CONTENT_MASTER_KEY_B64` | `SERVER_ONLY` | Yes | **YES** | Key unwrap for X25519 device re-wrapping |
| `CONTENT_MASTER_KEY_VERSION` | `SERVER_ONLY` | Yes | No | Active master key version |
