# HSC Study Platform — Repository Architecture Tree

```text
hsc-study-platform/
├── package.json                   # Monorepo root package configuration (npm workspaces: apps/mobile, apps/admin)
├── AGENTS.md                      # AI Operating Contract & Non-negotiable rules
├── README.md                      # Starter overview, quickstart & framework baselines
├── docker-compose.yml             # Docker worker + admin containerization setup
├── schemas/                       # Universal validation schemas & cryptographic specifications
│   ├── content-item.schema.json   # JSON Schema for universal AI/text content ingestion (formulas, CQs, MCQs)
│   ├── import-manifest.schema.json# Import manifest & package validation schema
│   └── hscp-format.md             # HSCP v1 chunked AES-256-GCM binary container specification
├── docs/                          # Architecture, security, operational and audit documentation
│   ├── ARCHITECTURE.md            # System architecture, data tiers, canonical syllabus & atomic publishing
│   ├── FULL_PROCESS.md            # Complete operator guide (Zero cloud → Production)
│   ├── SECURITY.md                # System threat model, DRM limits, boundary analysis
│   ├── READER_SECURITY.md         # Reader sandbox, watermarking & screenshot blocking analysis
│   ├── GOOGLE_DRIVE.md            # 5 TB Google Drive origin warehouse & OAuth setup
│   ├── AI_IMPORT_GUIDE.md         # AI content creation & JSONL normalization guidelines
│   ├── ANTIGRAVITY.md             # Antigravity agent integration contract
│   ├── OCR.md                     # Bengali OCR extension points & PyMuPDF notes
│   ├── OPERATIONS.md              # Publishing workflow, rollback & moderation rules
│   └── DEPLOYMENT.md              # Production deployment & hardening checklist
├── scripts/                       # Local environment and setup tooling
│   ├── doctor.mjs                 # Workspace health check (Node, Python, migrations, schemas)
│   ├── setup.ps1                  # Windows PowerShell automated workspace & venv setup
│   └── setup.sh                   # Linux/macOS automated workspace & venv setup
├── apps/
│   ├── mobile/                    # React Native + Expo student mobile application
│   │   ├── app.json               # Expo configuration (SDK 57, permissions, bundle IDs)
│   │   ├── package.json           # Mobile dependencies (Expo 57, RN 0.86, React 19.2, FlashList, Zustand, TanStack Query)
│   │   ├── tsconfig.json          # Strict TypeScript compiler options with path alias (@/*)
│   │   ├── tailwind.config.js     # NativeWind v4 configuration
│   │   ├── global.css             # NativeWind styling entry
│   │   ├── app/                   # Expo Router file-based route tree
│   │   │   ├── _layout.tsx        # Root layout with QueryClientProvider & GestureHandler
│   │   │   ├── index.tsx          # App entry bootstrap & redirect to (tabs)
│   │   │   ├── auth.tsx           # Authentication screen (Sign In / Register)
│   │   │   ├── (tabs)/            # Main bottom-tab navigator
│   │   │   │   ├── _layout.tsx    # Tab bar configuration & theme styling
│   │   │   │   ├── index.tsx      # Home dashboard (Streak counter, continue reading, daily sprint, subject cards)
│   │   │   │   ├── library.tsx    # Library screen (Search, subject filter pills, protected books FlashList)
│   │   │   │   ├── formulas.tsx   # Formula vault (LaTeX search, subject filters, starred favorites, detail modal)
│   │   │   │   ├── practice.tsx   # Practice lab (MCQ Sprint quiz launcher, Board CQ explorer, accuracy analytics)
│   │   │   │   └── profile.tsx    # Student profile (Study stats, offline storage inspector, cache purge)
│   │   │   ├── book/
│   │   │   │   └── [id].tsx       # Book details screen (Chapter intelligence, offline download, page bounds)
│   │   │   └── reader/
│   │   │       └── [id].tsx       # Secure Reader screen (Theme switch, screenshot guard, chapter jump, bookmarking)
│   │   ├── components/            # Reusable UI & Modal components
│   │   │   ├── BookCard.tsx       # Data-driven book card with HSCP badge and progress bar
│   │   │   ├── FormulaCard.tsx    # Formula card with LaTeX equation, importance rating and favorite toggle
│   │   │   ├── SubjectCard.tsx    # Subject card with accent styling and progress bar
│   │   │   ├── Screen.tsx         # Base safe area container
│   │   │   ├── SessionWatermark.tsx # Moving security watermark overlay
│   │   │   ├── ProtectedDownloadButton.tsx # Offline package downloader with live percentage
│   │   │   ├── ChapterListModal.tsx # Chapter index bottom sheet with page ranges & jump
│   │   │   ├── MCQQuizModal.tsx   # Interactive MCQ quiz runner with derivation reveal & score tracking
│   │   │   ├── CQViewerModal.tsx  # Board CQ reader with stimulus, sub-questions (ক/খ/গ/ঘ) & marking rubrics
│   │   │   └── FormulaDetailModal.tsx # Formula equation breakdown with SI units & LaTeX copy
│   │   ├── data/
│   │   │   └── demo.ts            # HSC syllabus demo datasets (Physics, Chem, Math, Bio, formulas, CQs, MCQs)
│   │   ├── lib/                   # Core business logic & native abstractions
│   │   │   ├── supabase.ts        # Supabase client initialization & demo fallback
│   │   │   ├── catalog.ts         # Type-safe catalog fetching (Subjects, Books, Formulas)
│   │   │   ├── deviceKeys.ts      # On-device X25519 keypair generation & SecureStore persistence
│   │   │   ├── devices.ts         # Remote device registration API
│   │   │   ├── download.ts        # Resumable package download & filesystem management
│   │   │   ├── hscp.ts            # Chunked AES-256-GCM package decryptor & cache materializer
│   │   │   ├── license.ts         # Edge function license retrieval & key unwrapping
│   │   │   ├── localDb.ts         # Expo SQLite local database & FTS index helper
│   │   │   ├── progress.ts        # Reading progress tracking & remote sync
│   │   │   ├── query.ts           # TanStack QueryClient configuration
│   │   │   └── base64.ts          # Base64 encoding/decoding utilities
│   │   └── store/                 # Global state management
│   │       ├── reader.ts          # Reader page & dark mode state
│   │       └── studyStore.ts      # Study streaks, bookmarks, favorite formulas, quiz attempts, reader theme
│   └── admin/                     # Next.js 16 Active LTS Admin Studio & Ingestion UI
│       ├── package.json           # Admin dependencies (Next.js 16, React 19, Tailwind v3, Lucide)
│       ├── next.config.ts         # Next.js configuration
│       ├── tsconfig.json          # TypeScript configuration
│       ├── tailwind.config.ts     # Tailwind configuration
│       ├── postcss.config.mjs     # PostCSS configuration
│       ├── app/
│       │   ├── layout.tsx         # Root HTML layout with Inter font
│       │   ├── page.tsx           # Admin dashboard & pipeline overview
│       │   └── globals.css        # Global Tailwind styling & theme tokens
│       ├── components/
│       │   ├── MetricCard.tsx     # KPI metric display card
│       │   └── UploadStudio.tsx   # File dropzone, AI JSONL importer, live pipeline monitor & publish review
│       └── lib/
│           ├── api.ts             # Content Factory Worker API client
│           └── supabase.ts        # Supabase SSR/browser client
├── services/
│   └── worker/                    # Python 3.12+ Content Factory (Ingestion, Normalization & Packaging)
│       ├── pyproject.toml         # Python project configuration & dependencies (FastAPI, PyMuPDF, cryptography)
│       ├── Dockerfile             # Container definition for worker
│       ├── app/
│       │   ├── api.py             # FastAPI HTTP endpoints (/health, /imports/upload, /imports/text, /publish)
│       │   ├── pipeline.py        # Pipeline orchestrator (Fingerprint → TOC → Dedupe → HSCP → Staging → Publish)
│       │   ├── pdf_analyzer.py    # PyMuPDF metadata, outline/TOC extraction, text density & formula detection
│       │   ├── parsers.py         # Multi-format parsers for PDF, TXT, MD, JSONL, and CSV
│       │   ├── dedupe.py          # Deterministic fingerprinting & RapidFuzz similarity deduplication
│       │   ├── hscp.py            # AES-256-GCM chunked packager, HMAC/tag verification & server key wrapping
│       │   ├── storage.py         # Storage abstraction (Local warehouse, Google Drive 5TB, Cloudflare R2)
│       │   ├── staging.py         # Disk-backed SQLite staging database for million-item imports
│       │   ├── packs.py           # Content pack bundler (chapter packs, search packs)
│       │   ├── search_index.py    # SQLite FTS5 full-text search index builder
│       │   ├── catalog.py         # Catalog publisher (Supabase service-role & LocalCatalog fallback)
│       │   ├── job_store.py       # SQLite persistent job queue & status tracker
│       │   ├── models.py          # Pydantic models for ImportJob, ContentItem, BookRecord, StorageObject
│       │   ├── config.py          # Environment settings & directory configurations
│       │   ├── ocr.py             # OCR extension point placeholder for scanned Bengali books
│       │   ├── ai.py              # AI normalization helper
│       │   ├── cli.py             # CLI runner for worker operations
│       │   └── utils.py           # SHA256 checksums, chunk splitting & binary utilities
│       ├── scripts/
│       │   └── google_oauth_bootstrap.py # Interactive OAuth desktop bootstrap for Google Drive 5TB
│       ├── samples/               # Sample input files (formulas.txt, chemistry_cq.jsonl)
│       └── tests/                 # Pytest test suite for worker encryption, dedupe, and pipeline
└── supabase/                      # Database migrations, RLS policies, and Edge Functions
    ├── migrations/
    │   ├── 0001_init.sql          # Core relational schema, RLS policies, triggers & indexes
    │   └── 0002_seed_demo.sql     # Seed data for HSC subjects, books, formulas & feature flags
    └── functions/
        └── book-license/
            └── index.ts           # Deno Edge Function: verifies user entitlement & X25519 re-wraps content key
```
