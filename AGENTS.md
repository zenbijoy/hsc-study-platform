# AI Agent Operating Contract

This repository is designed so Antigravity, Codex, Claude, Gemini, GitHub Copilot and other coding agents can extend content ingestion without directly mutating production tables.

## Non-negotiable rules

1. Never put a Supabase service-role key, Google OAuth refresh token, Drive credential, content master key, or signing secret in mobile or web client code.
2. Never allow an AI agent to write directly to production content tables. AI output goes through an import manifest, validation, deduplication and review/commit pipeline.
3. Never store full PDFs or million-item CQ bodies in Postgres. Store large objects/content packs in Drive/R2 and keep only catalog metadata in Supabase.
4. New content types must implement a versioned schema under `schemas/` and a parser/normalizer in `services/worker/app/`.
5. Imports must be idempotent using `source_hash` and must support rollback by `import_id`.
6. Protected book files are encrypted HSCP packages. Original PDFs stay private.
7. A decrypted PDF may exist only in app cache while the reader is active. Delete it on reader exit. This starter uses a practical cache-materialization renderer; replacing it with an in-memory/page-tile native renderer is the production hardening path.
8. Screen-capture blocking and DRM are deterrents, not a mathematical guarantee against a rooted/instrumented device or external camera.
9. Only distribute content for which the operator has the necessary rights or permission.

## Agent-friendly ingestion workflow

- Generate JSONL matching `schemas/content-item.schema.json`.
- POST it to the worker `/v1/imports/text` endpoint or save it in `services/worker/samples/`.
- Poll `/v1/imports/{id}`.
- Review low-confidence/invalid items in Admin Studio.
- Commit/publish only after validation.

## Build targets

- Mobile: Expo SDK 57 / React Native 0.86 / React 19.2
- Admin: Next.js 16.3.x Active LTS
- Worker: Python 3.12+ / FastAPI / PyMuPDF / cryptography
