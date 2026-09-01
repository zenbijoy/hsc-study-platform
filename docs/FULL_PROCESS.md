# Full End-to-End Process — HSC Study Platform

This document is the practical operator guide for taking the repository from a fresh ZIP to a working local demo, then wiring Supabase + Google Drive, importing a large PDF, generating chapter/formula/CQ packs, and building the Android app.

> The platform is a content-delivery and learning system. Only publish material you own or have permission/licence to distribute. Security controls reduce casual copying; no mobile DRM can guarantee impossible extraction on a fully compromised/rooted device.

---

## 0. Final architecture

```text
Student Mobile App (Expo/React Native)
        |
        | Auth, catalog, progress, bookmarks
        v
Supabase (Auth + PostgreSQL + RLS)
        |
        | tiny metadata / object IDs only
        v
Google Drive 5 TB (private origin warehouse)
        ^
        |
Python Content Factory on your PC/VPS
  - PDF/TXT/JSONL/CSV ingestion
  - TOC/chapter detection
  - formula/CQ/MCQ normalization
  - dedupe + confidence
  - search pack generation
  - HSCP AES-256-GCM encryption
        |
        +--> Optional Cloudflare R2 hot-cache later

Admin Studio (Next.js)
        |
        +--> /books (Book Catalog Manager & Bulk Operations)
        +--> /books/[bookId] (11-Tab Single Book Studio & Visual Chapter Editor)
        +--> /publishing (Publishing Quality Console & Bulk Release)
        +--> /quality (Content Quality Dashboard & Issue Scanner)
        +--> /imports/bulk (Mass Ingestion Studio — Drive Inbox & Local Folder discovery)
        +--> /review (Accelerated Review Queue & Hotkeys Studio)
        +--> /books/import (Single PDF Upload Studio)
        +--> Content Factory & CMS API (/v1/books, /v1/quality, /v1/issues...)
```

Supabase is the **brain**, Google Drive is the **warehouse**, the Python worker is the **factory**, and the React Native app is the **learning client**.

---

## 1. Install prerequisites

Recommended on Windows 11:

- Node.js 22.13 or newer
- Python 3.12+
- Git
- Android Studio + Android SDK for native Android builds
- Java/JDK supported by the current Expo/React Native toolchain
- A Google account owning the 5 TB Drive
- Optional: Supabase CLI and EAS CLI

Check:

```powershell
node -v
npm -v
python --version
git --version
```

---

## 2. Extract the ZIP

Example:

```text
D:\Projects\hsc-study-platform
```

Open PowerShell in the project root.

---

## 3. One-time local setup

### Windows

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\setup.ps1
```

This installs Node workspaces, creates the worker Python virtual environment, installs worker dependencies and creates local `.env` files from examples.

### Linux/macOS

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

---

## 4. First run with ZERO cloud credentials

Use this first. It proves the whole project before Supabase/Drive configuration.

### Terminal 1 — Content Factory

```powershell
cd services\worker
.\.venv\Scripts\Activate.ps1
uvicorn app.api:app --reload --port 8787
```

Worker URL:

```text
http://localhost:8787
```

### Terminal 2 — Admin Studio

From repository root:

```powershell
npm run admin
```

Open:

```text
http://localhost:3000
http://localhost:3000/books/import (PDF Upload Studio)
```

### Terminal 3 — Mobile app

```powershell
npm run mobile
```

The project starts in demo mode if Supabase is not configured.

For the secure PDF/native behavior, use an Expo Development Build rather than Expo Go.

```powershell
cd apps\mobile
npx expo install --fix
npx expo prebuild
npx expo run:android
```

---

## 5. Verify the repository

From root:

```powershell
npm run doctor
```

Worker tests:

```powershell
cd services\worker
.\.venv\Scripts\Activate.ps1
pytest -q
```

Expected starter result: all worker tests pass.

---

# PART A — SUPABASE

## 6. Create Supabase project

Create a Supabase project and save:

```text
Project URL
Publishable/anon key
Service-role key
```

The service-role key is **server-only**. Never put it in the mobile app or Admin browser bundle.

---

## 7. Apply database schema

Run these SQL files in order in Supabase SQL Editor:

```text
supabase/migrations/0001_init.sql
supabase/migrations/0002_seed_demo.sql
```

The schema includes catalog tables, canonical syllabus structures, books/book versions, chapter ranges, content-pack pointers, user state, device registrations, entitlement/license state, import state and RLS policies.

---

## 8. Configure mobile Supabase

Edit:

```text
apps/mobile/.env
```

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
EXPO_PUBLIC_LICENSE_FUNCTION_URL=https://YOUR_PROJECT.supabase.co/functions/v1/book-license
EXPO_PUBLIC_DEMO_MODE=false
```

Only public client credentials belong here.

---

## 9. Configure Admin Studio

Edit:

```text
apps/admin/.env.local
```

```env
NEXT_PUBLIC_INGEST_API_URL=http://localhost:8787
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

In production, put Admin Studio behind authenticated staff access/zero-trust protection.

---

## 10. Configure worker Supabase credentials

Edit:

```text
services/worker/.env
```

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Never commit this file.

---

# PART B — GOOGLE DRIVE 5 TB

## 11. Create Drive warehouse folder

Create a private folder such as:

```text
HSC_CONTENT_FACTORY
```

Recommended logical layout:

```text
HSC_CONTENT_FACTORY/
  00_INBOX/
  10_ORIGINALS/
  20_SECURE_BOOKS/
  30_CONTENT_PACKS/
  40_ASSETS/
  90_BACKUPS/
```

The worker can also manage files under one configured root folder using Drive metadata.

Copy the root folder ID from the Drive URL.

---

## 12. Enable Google Drive API

In Google Cloud Console:

1. Create a project.
2. Enable **Google Drive API**.
3. Configure the OAuth consent screen.
4. Create an **OAuth Desktop App** client.
5. Download its `client_secret.json`.

For a personal 5 TB Google One/Drive account, OAuth refresh-token mode is the correct default.

---

## 13. Generate Google refresh token

Place `client_secret.json` inside:

```text
services/worker/
```

Then:

```powershell
cd services\worker
.\.venv\Scripts\Activate.ps1
python scripts\google_oauth_bootstrap.py --client-secret client_secret.json
```

Sign in with the account owning the 5 TB Drive.

Copy the generated values into `services/worker/.env`:

```env
STORAGE_PROVIDER=drive
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_DRIVE_FOLDER_ID=...
GOOGLE_DRIVE_PUBLIC_PACKAGES=false
```

Do not put these credentials in React Native or Next.js public environment variables.

---

# PART C — CONTENT ENCRYPTION

## 14. Create master encryption key

Generate 32 random bytes:

```powershell
python -c "import os,base64; print(base64.b64encode(os.urandom(32)).decode())"
```

Put the output in worker `.env`:

```env
CONTENT_MASTER_KEY_B64=YOUR_BASE64_KEY
CONTENT_MASTER_KEY_VERSION=1
```

Store a secure backup of this secret. Losing it can make previously protected content impossible to license/decrypt.

Do not commit it.

---

## 15. Deploy license Edge Function

The repository includes:

```text
supabase/functions/book-license/index.ts
```

Configure the function with:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
CONTENT_MASTER_KEY_B64
CONTENT_MASTER_KEY_VERSION
```

Then deploy it using Supabase CLI.

The intended license flow is:

```text
Mobile generates X25519 device keypair
        ↓
Private key stays in Android Keystore/iOS Keychain
        ↓
Public key registered with backend
        ↓
Book content key exists server-side/wrapped
        ↓
License function verifies user + entitlement + device
        ↓
Content key is re-wrapped for that device
        ↓
Mobile unwraps and reads encrypted HSCP chunks
```

---

# PART D — IMPORT A 300 MB PDF

## 16. Start worker + Admin

Worker:

```powershell
cd services\worker
.\.venv\Scripts\Activate.ps1
uvicorn app.api:app --reload --port 8787
```

Admin:

```powershell
npm run admin
```

Open `http://localhost:3000`.

---

## 17. Upload the PDF

Use Admin Studio → **Intelligent Content Import**.

Example:

```text
Physics_1st_Paper.pdf
300 MB
```

The source file is uploaded to the configured storage provider. With `STORAGE_PROVIDER=drive`, the heavy source lives in Google Drive, not Postgres.

Supabase stores tiny catalog references/metadata only.

---

## 18. Processing pipeline

The worker performs a persisted job pipeline:

```text
HASH SOURCE
   ↓
IDEMPOTENCY CHECK
   ↓
PDF METADATA
   ↓
TOC / OUTLINE ANALYSIS
   ↓
CHAPTER CANDIDATES
   ↓
TEXT EXTRACTION
   ↓
FORMULA/CQ/MCQ NORMALIZATION
   ↓
DEDUPE
   ↓
CONFIDENCE SCORE
   ↓
CONTENT PACKS
   ↓
FTS SEARCH INDEX
   ↓
HSCP ENCRYPTION
   ↓
UPLOAD DERIVED ARTIFACTS
   ↓
REVIEW
   ↓
ATOMIC PUBLISH
```

A digital PDF containing bookmarks/TOC can produce chapter structure quickly. A scanned 300 MB book requires OCR and naturally takes longer. The architecture supports progressive processing so quick structure can appear before deep processing finishes.

---

## 19. Chapter organization

Do not duplicate the complete book into separate PDFs by default.

Keep:

```text
Original PDF: one object
Chapter 1: pages 10–42
Chapter 2: pages 43–81
Chapter 3: pages 82–124
```

Generate a separate encrypted chapter pack only when offline chapter downloads are useful.

This prevents 300 MB from becoming 600 MB+ due to needless copies.

---

# PART E — FORMULA / CQ / MCQ MASS IMPORT

## 20. Formula text import

A sample exists at:

```text
services/worker/samples/formulas.txt
```

You can create files in the supported text format and upload them in Admin Studio.

The system parses, normalizes, deduplicates, assigns confidence and creates content packs. The React Native app renders them through reusable dynamic components; you do not create one screen per formula.

---

## 21. AI/Antigravity JSONL import

Best format for huge AI-generated datasets:

```jsonl
{"type":"formula","subject":"physics","paper":1,"chapter":"motion","title":"First equation of motion","latex":"v=u+at","importance":5}
{"type":"cq","subject":"physics","paper":1,"chapter":"motion","question":"A body starts from rest...","board":"Dhaka","year":2025,"difficulty":3}
```

Schemas:

```text
schemas/content-item.schema.json
schemas/import-manifest.schema.json
```

Tell Antigravity/Gemini/another AI:

> Generate only data matching `schemas/content-item.schema.json`. Do not write directly to Supabase. Save JSONL and send it through the Universal Importer.

This allows very large imports while keeping database quality controlled.

---

## 22. Million-CQ strategy

Do **not** insert one million long CQ rows into Supabase Free Postgres.

Use:

```text
1,000,000 JSONL records
        ↓
stream parser
        ↓
normalization
        ↓
dedupe
        ↓
classification
        ↓
batches/content packs
        ↓
Drive/R2 object files
```

Supabase keeps only pack metadata, versions, counts and relationships needed for the hot catalog.

Mobile downloads only the relevant chapter/content pack and uses SQLite/FTS locally.

---

# PART F — MOBILE SECURITY

## 23. HSCP offline packages

Students do not receive a normal PDF in Downloads.

They receive an encrypted package such as:

```text
physics-v7.hscp
```

The starter uses chunked AES-256-GCM so the application can authenticate/decrypt pieces rather than trusting a giant plaintext blob.

The user may be able to copy the `.hscp` file, but ordinary PDF software cannot read it and a device-bound license is required to obtain the usable content key.

---

## 24. Screenshot / screen recording protection

Protected reader screens use the Expo/native screen-capture prevention API where the OS supports it.

The secure reader also includes dynamic watermarking and avoids normal Share/Export/Open-With controls.

Do not apply screenshot blocking to the entire app. Keep it for protected book pages so students can still screenshot their own notes or allowed formula cards if your policy permits it.

---

## 25. Current starter reader security boundary

The starter is production-oriented but not a commercial DRM SDK. Current flow can temporarily materialize decrypted PDF content in app-private cache for the native PDF renderer and then clean it up.

For a stronger future version, replace that renderer path with an in-memory/page-tile native renderer so a complete decrypted PDF is never materialized even in private cache.

Also consider Play Integrity/App Attest and root/debug/instrumentation risk signals before a high-value production launch.

---

# PART G — ANDROID DEVELOPMENT BUILD

## 26. Configure application IDs

Before release, replace the example package/bundle IDs in:

```text
apps/mobile/app.json
```

with your own unique identifiers.

---

## 27. Run on physical Android phone

Enable Developer Options + USB debugging, connect the phone, verify:

```powershell
adb devices
```

Then:

```powershell
cd apps\mobile
npx expo prebuild
npx expo run:android
```

After the native dev build exists, most JS/TS/UI edits support fast refresh.

---

## 28. Production EAS build

Configure EAS:

```powershell
cd apps\mobile
npx eas-cli login
eas build:configure
```

Then create an Android build using the included `eas.json` profiles.

Before release test on real devices:

- login/logout
- background/foreground transitions
- temporary decrypted cache cleanup
- screenshot blocking
- expired/revoked license
- second-device behavior
- offline download resume
- corrupt HSCP hash/tag failure
- low-storage phone behavior
- 300 MB+ package download

---

# PART H — PRODUCTION OPERATIONS

## 29. Keep the worker private

The Content Factory is an operator/publisher service. Do not expose an anonymous 2 GB upload endpoint to the internet.

Use one of:

- local PC only
- private VPS
- VPN
- Cloudflare Access/Zero Trust
- authenticated reverse proxy

Admin Studio should be restricted to staff.

---

## 30. Drive is origin, not forever CDN

Use Google Drive 5 TB as your canonical private warehouse.

When traffic becomes large:

```text
Drive = cold/origin copy
R2 = popular encrypted packages / hot cache
```

The storage abstraction is already present so you can evolve without changing your catalog architecture.

---

## 31. Publishing rules

Never auto-publish raw AI output.

Recommended state flow:

```text
UPLOADED
  ↓
PARSED
  ↓
NORMALIZED
  ↓
DEDUPED
  ↓
REVIEW_REQUIRED / HIGH_CONFIDENCE
  ↓
VERIFIED
  ↓
PUBLISHED
```

For books/questions/formulas, keep source hash, import ID, version and rollback metadata.

---

## 32. Recommended first production milestone

Do not import your entire library first.

Finish this exact proof:

```text
1 real permitted PDF (~300 MB)
        ↓
Google Drive origin
        ↓
Supabase metadata
        ↓
chapter map
        ↓
formula extraction/import
        ↓
search pack
        ↓
HSCP encrypted package
        ↓
Android physical-device download
        ↓
offline reader
        ↓
screenshot protection
        ↓
progress/bookmark sync
```

Only after that works reliably, bulk-import larger libraries and million-record datasets.

---

# PART I — THREE-TERMINAL DAILY DEVELOPMENT WORKFLOW

### Terminal A

```powershell
cd services\worker
.\.venv\Scripts\Activate.ps1
uvicorn app.api:app --reload --port 8787
```

### Terminal B

```powershell
npm run admin
```

### Terminal C

```powershell
npm run mobile
```

Once you have installed the native development build on your phone, UI/logic edits can use normal Expo fast refresh unless you change native dependencies/configuration.

---

# PART J — IMPORTANT FILES

```text
README.md                              main overview
docs/ARCHITECTURE.md                   system design
docs/GOOGLE_DRIVE.md                   5 TB Drive setup
docs/SECURITY.md                       threat model
docs/READER_SECURITY.md                reader/DRM notes
docs/AI_IMPORT_GUIDE.md                AI content import
docs/ANTIGRAVITY.md                    Antigravity workflow
docs/OCR.md                            OCR extension points
docs/OPERATIONS.md                     content operations
docs/DEPLOYMENT.md                     production checklist
schemas/content-item.schema.json       universal AI content schema
schemas/import-manifest.schema.json    import manifest schema
supabase/migrations/0001_init.sql      database + RLS
supabase/functions/book-license/       device-license function
services/worker/app/                    Content Factory
apps/admin/                             Admin Studio
apps/mobile/                            student application
```

---

# PART K — WHAT “INDUSTRY-GRADE STARTER” MEANS

This repository gives you the production architecture, security boundaries, ingestion system, schemas, queue/persistence model, storage abstraction and working demo path. Before a real public launch, you still must supply your own cloud credentials, production identity/access controls, app signing IDs, physical-device security testing, copyright/licence records, reviewer workflow, backup/restore procedures and monitoring.

A 5 TB Drive solves your origin-storage problem very well, but storage capacity is not the same as unlimited delivery bandwidth. Keep the origin private and introduce R2/CDN hot delivery when traffic requires it.
