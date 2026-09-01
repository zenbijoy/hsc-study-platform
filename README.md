# HSC Study Platform — Industry-grade Starter Monorepo

A production-oriented starter for a secure HSC study library with:

- **React Native + Expo SDK 57** mobile app
- **NativeWind-style utility UI**, Reanimated-ready motion, FlashList, Zustand, TanStack Query
- **Supabase Auth/Postgres/RLS** for identity, catalog metadata, progress, bookmarks, devices and entitlement state
- **Google Drive** as the large-file origin/warehouse (local filesystem fallback included so the project runs without credentials)
- **Cloudflare R2 S3-compatible provider** for optional hot-cache/CDN delivery
- **Python Content Factory** for PDF/TXT/JSONL ingestion, chapter detection, formulas, CQ/MCQ parsing, dedupe, validation, content packs and searchable indexes
- **HSCP encrypted offline packages** using chunked AES-256-GCM
- **X25519 device-key license wrapping** design for per-device content-key delivery
- **Screenshot/screen-recording blocking** on protected reader screens where the OS supports it
- **Dynamic watermarking**, no share/export controls and temporary decrypted cache cleanup
- **Next.js Admin Studio** with polished upload/processing/review UI
- **Universal schemas** so Antigravity/AI agents can generate content safely without touching production tables

> Security note: no consumer DRM can make extraction *impossible* on a rooted/instrumented device. This architecture is designed to prevent casual copying, keep originals private, make offline files unusable outside the app, support device-bound entitlements and enable revocation. A determined attacker controlling the device can still potentially capture displayed plaintext.
>
> Content note: this code protects delivery; it does not grant redistribution rights. Only publish content you are authorized to distribute.

**Start here for the complete setup:** [`docs/FULL_PROCESS.md`](docs/FULL_PROCESS.md)

## 1. Repository layout

```text
apps/mobile          Expo student app
apps/admin           Next.js admin studio
services/worker      Python ingestion + encryption + Drive provider
supabase/migrations  Database schema, RLS, RPCs
supabase/functions   Device license Edge Function
schemas              AI/import JSON schemas
docs                 Architecture, Drive, security and operations docs
scripts              Local doctor/setup helpers
```

## 2. Quick demo — zero cloud credentials

### Prerequisites

- Node.js 22.13+
- Python 3.12+

### Worker

```bash
cd services/worker
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# Linux/macOS: source .venv/bin/activate
pip install -e '.[dev]'
cp .env.example .env
uvicorn app.api:app --reload --port 8787
```

The worker defaults to `STORAGE_PROVIDER=local`, so uploaded files are written under `services/worker/var/warehouse/` instead of Drive.

### Admin Studio

```bash
npm install
cp apps/admin/.env.example apps/admin/.env.local
npm run admin
```

Open `http://localhost:3000`. Upload a PDF, TXT, Markdown, JSONL or CSV. The worker creates a persisted import job, extracts/organizes content, and exposes progress to the UI.

### Mobile

```bash
cp apps/mobile/.env.example apps/mobile/.env
npm run mobile
```

For the actual PDF reader and secure native behavior, use an **Expo Development Build**, not Expo Go:

```bash
cd apps/mobile
npx expo install --fix
npx expo prebuild
npx expo run:android
```

The demo falls back to bundled catalog data when Supabase is not configured.

### One-command setup helpers

Windows PowerShell:

```powershell
./scripts/setup.ps1
```

Linux/macOS:

```bash
./scripts/setup.sh
```

Docker worker + admin is also included via `docker-compose.yml`. See `docs/DEPLOYMENT.md` before exposing the worker to the internet.

## 3. Production wiring order

1. Create Supabase project and run `supabase/migrations/0001_init.sql` then `0002_seed_demo.sql`.
2. Configure `apps/mobile/.env` with Supabase URL + publishable key.
3. Configure worker with Supabase URL + service-role key **server-side only**.
4. Configure Google Drive OAuth using `docs/GOOGLE_DRIVE.md`.
5. Set `STORAGE_PROVIDER=drive` in worker.
6. Generate `CONTENT_MASTER_KEY_B64` and set it in both worker and Supabase Edge Function secrets.
7. Deploy `supabase/functions/book-license`.
8. Build a development client / release app with EAS.
9. Keep originals private. Only encrypted HSCP packages may be exposed for direct delivery.
10. Add R2 as a hot-cache when Drive bandwidth or latency becomes a bottleneck.

## 4. 300 MB book → small Supabase catalog

The 300 MB original is stored in Drive. Postgres stores only identifiers and metadata:

```text
books row                        ~ KB
book_versions row               ~ KB
chapter boundaries              ~ tens of KB
pack catalog                    ~ KB
user progress/bookmarks         tiny per user
```

Heavy page text, CQ/MCQ/formula datasets, search indexes and encrypted packages are object files in Drive/R2.

## 5. One upload → content factory

```text
PDF/TXT/JSONL/CSV
      ↓
source hash + idempotency check
      ↓
metadata extraction
      ↓
TOC / chapter candidates
      ↓
formula / CQ / MCQ normalization
      ↓
dedupe + confidence score
      ↓
content packs + FTS index
      ↓
HSCP encryption for protected books
      ↓
Drive/local warehouse upload
      ↓
Admin review
      ↓
atomic publish/version switch
```

A digital PDF with bookmarks can get a chapter map in seconds. A 300 MB scanned book requiring OCR will take longer; the UI uses **progressive processing** so basic structure can become available before deep OCR/enrichment finishes.

## 6. AI ingestion

Ask any AI agent to emit JSONL using `schemas/content-item.schema.json`. Example:

```jsonl
{"type":"formula","subject":"physics","paper":1,"chapter":"motion","title":"First equation of motion","latex":"v=u+at","importance":5}
{"type":"cq","subject":"physics","paper":1,"chapter":"motion","question":"A body starts from rest...","board":"Dhaka","year":2025,"difficulty":3}
```

Then upload the file in Admin Studio. The backend owns organization, dedupe, confidence, validation, versioning and publication.

## 7. Current framework baselines

The starter targets Expo SDK 57, which officially maps to React Native 0.86 and React 19.2. Next.js is pinned to the current 16.3 Active LTS security line as of September 2026. Run `npx expo install --fix` after install so Expo resolves exact compatible native package versions.

## 8. What is fully implemented vs extension points

Implemented in the starter:

- runnable demo catalog/mobile UI
- secure-reader screen capture blocking + moving session watermark
- device X25519 key generation/storage
- Supabase client abstraction with demo fallback
- persisted upload/import queue
- PDF metadata + TOC/bookmark chapter detection using PyMuPDF
- plain-text formula/CQ/MCQ parsers
- JSONL/CSV ingestion
- deterministic dedupe and confidence fields
- HSCP chunked AES-256-GCM builder/decrypter (Python)
- server master-key wrapping and device license protocol code
- local storage provider + Google Drive provider + Cloudflare R2 provider
- polished Admin Studio progress UI
- SQL schema + RLS + seed

Production extension points:

- OCR engine selection for scanned Bengali books
- true in-memory/page-tile PDF renderer (the starter securely materializes a temporary decrypted PDF in app cache for `react-native-pdf`, then deletes it)
- production CDN routing/cache promotion policy (the R2 storage provider itself is included)
- teacher moderation workflows and advanced semantic search/embeddings
- Play Integrity / App Attest integration

Read `docs/ARCHITECTURE.md` and `docs/SECURITY.md` before production deployment.
