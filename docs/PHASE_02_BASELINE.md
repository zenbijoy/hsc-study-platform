# Phase 02 Baseline Checkpoint

**Checkpoint Date**: September 2026  
**Git Baseline Commit**: `18fa7f1 (baseline: phase 01 verified state)`  
**Branch**: `master`  

---

## 1. Baseline State Summary

- **Node.js**: v24.16.0 (supported by root engine constraint `>=22.13`)
- **Package Workspaces**: `apps/mobile`, `apps/admin` (722 packages installed, zero install errors)
- **TypeScript Health**: Strict mode passing across all workspaces (`npm run typecheck` exits with code 0)
- **Next.js Admin Studio**: Next.js 16.3.3 Active LTS compiles cleanly via Turbopack (`npm --workspace apps/admin run build` exits with code 0)
- **Doctor Verification**: `node scripts/doctor.mjs` verifies all migrations, schemas, and workspace structures.

---

## 2. Environment Prerequisites

| Environment | Requirement | Status |
|---|---|---|
| `apps/mobile/.env` | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_DEMO_MODE` | Initialized from example |
| `apps/admin/.env.local` | `NEXT_PUBLIC_INGEST_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Initialized from example |
| `services/worker/.env` | `STORAGE_PROVIDER`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CONTENT_MASTER_KEY_B64` | Initialized from example |

---

## 3. Scope of Phase 02 Foundation Repair

1. Standardize Environment Variable architecture (`docs/ENVIRONMENT_VARIABLES.md`) with strict Zod/schema validation.
2. Standardize Mobile Directory Structure (`src/` architecture with features, repositories, providers, store).
3. Centralize domain types (`Subject`, `Book`, `Formula`, `Question`, `AppError`).
4. Centralize Supabase mobile client, TanStack Query key factory, and default QueryClient settings.
5. Implement deterministic Auth Hydration state machine (`AuthStatus`) and route guards.
6. Implement App Startup Orchestrator with boot timing logs.
7. Implement reusable Error Boundary, Loading Primitives, and Network status handler.
8. Establish SQLite migration schema and transactional sync engine with throttled progress writing.
9. Formalize plaintext content lifecycle policy (`docs/PLAINTEXT_CONTENT_POLICY.md`).
10. Lock architecture contracts (`docs/ARCHITECTURE_LOCK.md`) and complete foundation documentation (`docs/PHASE_02_FOUNDATION_REPORT.md`).
