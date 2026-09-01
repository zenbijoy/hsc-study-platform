# Pre-Launch Release Checklist

Complete this checklist prior to flipping production DNS and launching the mobile app to students.

---

## Pre-Flight Verification Checklist

- [x] **Database Migrations**: All migrations `0001` through `0011` applied in sequential order on production database.
- [x] **Row-Level Security**: Tested and verified for anonymous, student, admin, and service-role personas.
- [x] **Google Drive Security**: Verified `10_ORIGINALS` folder is strictly private with zero public link sharing.
- [x] **Master Key**: Generated 32-byte Base64 key configured in `CONTENT_MASTER_KEY_B64` on worker and Edge Functions.
- [x] **Worker Service**: Worker running with restart policy `unless-stopped` and responding healthy at `GET /health`.
- [x] **Admin Studio**: Next.js production build compiled cleanly with 0 TypeScript and ESLint errors.
- [x] **Admin Security Headers**: `nosniff`, `SAMEORIGIN`, `XSS`, and `Referrer-Policy` enabled.
- [x] **Publishing Quality Gates**: Verified that `UNVERIFIED` rights status strictly blocks publication.
- [x] **Mobile Release Build**: Android `app.json` verified with zero unnecessary permissions and file sharing disabled.
- [x] **Mobile Offline Reader**: Offline encrypted container decryption verified in flight mode with local cache sandbox.
- [x] **Atomic Rollback**: Version rollback verified with 0-downtime pointer switch.
- [x] **Disaster Recovery Plan**: Logical backup commands and storage reconciliation procedures documented.
