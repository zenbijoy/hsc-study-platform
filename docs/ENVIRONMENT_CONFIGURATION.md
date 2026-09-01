# Complete Environment Variable Reference

This document catalogs every environment variable used across the HSC Study Platform, categorized by service and confidentiality level.

---

## 1. Variable Classification Summary

- **SERVER-ONLY (CRITICAL SECRET)**: Must NEVER be exposed to browser, mobile bundle, or version control.
- **PUBLIC CLIENT-SAFE**: Safe to be bundled into mobile/admin builds.

---

## 2. Server-Side Worker (`services/worker/.env`)

| Variable Name | Required | Classification | Purpose | Example Placeholder |
|---|---|---|---|---|
| `STORAGE_PROVIDER` | Yes | Server Config | Storage backend (`local`, `drive`, `r2`) | `drive` |
| `WAREHOUSE_DIR` | When local | Server Config | Local warehouse directory path | `./var/warehouse` |
| `INBOX_DIR` | When local | Server Config | Local inbox directory path | `./var/inbox` |
| `JOB_DB` | Yes | Server Config | SQLite queue database path | `./var/jobs.sqlite3` |
| `CATALOG_FILE` | Yes | Server Config | Local fallback catalog path | `./var/catalog.json` |
| `CORS_ORIGINS` | Yes | Server Config | Comma-separated allowed HTTP origins | `https://admin.yourdomain.com` |
| `WORKER_CONCURRENCY` | Yes | Server Config | Number of parallel processing workers (1-8) | `2` |
| `MAX_UPLOAD_BYTES` | Yes | Server Config | Max file upload limit in bytes | `2147483648` (2GB) |
| `CONTENT_MASTER_KEY_B64` | Yes | **CRITICAL SECRET** | 32-byte AES-256 master key for HSCP wrapping | `Base64(32_random_bytes)` |
| `CONTENT_MASTER_KEY_VERSION` | Yes | Server Config | Key version integer | `1` |
| `SUPABASE_URL` | Optional | Server Config | Supabase Project URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | **CRITICAL SECRET** | Supabase Service Role Key (bypasses RLS) | `eyJhbGciOi...` |
| `GOOGLE_CLIENT_ID` | When drive | Server Config | Google OAuth 2.0 Client ID | `1234...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | When drive | **CRITICAL SECRET** | Google OAuth 2.0 Client Secret | `GOCSPX-...` |
| `GOOGLE_REFRESH_TOKEN` | When drive | **CRITICAL SECRET** | Long-lived Google OAuth Refresh Token | `1//04...` |
| `GOOGLE_DRIVE_FOLDER_ID` | When drive | Server Config | Root warehouse folder ID in Google Drive | `1A2B3C4D5E...` |
| `R2_ACCOUNT_ID` | When r2 | Server Config | Cloudflare R2 Account ID | `abc123...` |
| `R2_ACCESS_KEY_ID` | When r2 | **CRITICAL SECRET** | Cloudflare R2 Access Key | `abc...` |
| `R2_SECRET_ACCESS_KEY` | When r2 | **CRITICAL SECRET** | Cloudflare R2 Secret Key | `xyz...` |
| `R2_BUCKET` | When r2 | Server Config | Cloudflare R2 Bucket Name | `hsc-content-warehouse` |

---

## 3. Admin Studio (`apps/admin/.env.local`)

| Variable Name | Required | Classification | Purpose | Example Placeholder |
|---|---|---|---|---|
| `NEXT_PUBLIC_INGEST_API_URL` | Yes | PUBLIC | URL to Python Content Factory / CMS API | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | PUBLIC | Supabase Project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional | PUBLIC | Supabase anon/publishable key | `eyJhbGciOi...` |

---

## 4. Mobile Client (`apps/mobile/.env`)

| Variable Name | Required | Classification | Purpose | Example Placeholder |
|---|---|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | PUBLIC | Supabase Project URL | `https://xyz.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | PUBLIC | Supabase anon/publishable key | `eyJhbGciOi...` |
| `EXPO_PUBLIC_LICENSE_FUNCTION_URL` | Yes | PUBLIC | Edge function URL for license verification | `https://xyz.supabase.co/functions/v1/book-license` |
| `EXPO_PUBLIC_DEMO_MODE` | Yes | PUBLIC | Demo fallback mode toggle (`false` in prod) | `false` |
