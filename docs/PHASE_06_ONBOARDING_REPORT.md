# Phase 06 Master Report: HSC Student Onboarding & Personalization

**Milestone**: Phase 06 HSC Student Onboarding + Profile Personalization + Academic Preference Setup  
**Status**: COMPLETED & VERIFIED  
**Auditor**: Antigravity AI Engineering Engine  

---

## 1. Executive Summary

Phase 06 establishes a fast, 60-second academic personalization wizard for HSC candidates. The flow gathers only essential data required to customize textbooks, chapters, formulas, and practice sets (Batch Year, Group, Board, Preferred Subjects, and Study Focus). The subsystem guarantees zero data loss via local SQLite draft persistence and performs a single, atomic transactional commit to PostgreSQL via the `complete_onboarding_atomic` RPC.

---

## 2. Onboarding Steps & Experience

```text
[Step 1: WELCOME]
  - Personalized greeting: "Welcome, <StudentName> 👋"
  - Short value proposition (1 minute completion time)
          │
          ▼
[Step 2: ACADEMIC YEAR]
  - Select target exam batch (HSC 2026, 2027, 2028, 2025 Special)
          │
          ▼
[Step 3: ACADEMIC GROUP]
  - Select Science (Available) or Business/Humanities (Coming Soon badges)
          │
          ▼
[Step 4: EDUCATION BOARD]
  - 11 Bangladesh education boards (Dhaka, Rajshahi, Chattogram, Cumilla, etc.)
          │
          ▼
[Step 5: PREFERRED SUBJECTS]
  - Multi-select Science subjects (Physics, Chemistry, Higher Math, Biology, ICT)
          │
          ▼
[Step 6: STUDY PREFERENCES & REVIEW]
  - Study focus toggles (Textbooks, Formulas, Board CQs, MCQ Practice, Quick Revision)
  - Daily goal selector (15, 30, 60 mins)
  - Review card summary + "Finish Setup & Start Studying"
```

---

## 3. Database Architecture & Atomic RPC

### Migration `0003_onboarding_atomic_rpc.sql`
- Adds to `public.profiles`:
  - `onboarding_completed` (boolean, default false)
  - `onboarding_status` (`not_started`, `in_progress`, `completed`)
  - `preferred_subjects` (text[])
  - `study_focus` (text[])
  - `daily_goal_minutes` (int, default 30)
- **RPC `complete_onboarding_atomic`**:
  - Uses `auth.uid()` securely on the database level (zero client user ID spoofing).
  - Validates year (2024–2035) and required non-empty group and board.
  - Updates profile, subjects, preferences, and marks onboarding complete in a single atomic transaction.

---

## 4. Local Draft Persistence & Offline Resilience

- **Local Store**: State changes are saved to SQLite (`cached_content` table) as `onboarding_draft`. If a student switches apps or reboots their phone, the draft is restored automatically.
- **Offline Behavior**: If the student fills out their draft while offline, selections remain safely cached on-device with clear guidance to connect when finalizing the server commit.
- **Empty-Array Protection**: Undefined partial preference updates do not erase existing selected subjects.

---

## 5. Personalization Model & Selectors

Located in `apps/mobile/src/features/onboarding/selectors/personalization.ts`:
- `getPreferredSubjectIds(profile)`: Extracts student's prioritized subject list.
- `getStudentAcademicContext(profile)`: Generates formatted academic badges (e.g. `HSC '27 • Science (Rajshahi Board)`).

---

## 6. Verification & Test Results

- `node scripts/test_phase06_onboarding.mjs`: **✓ PASSED (Payload validation, empty-array protection, context selectors, RPC syntax)**
- `node scripts/test_phase05_auth.mjs`: **✓ PASSED (5/5 suites)**
- `node scripts/test_phase04_shell.mjs`: **✓ PASSED (4/4 tests)**
- `node scripts/test_foundation.mjs`: **✓ PASSED (4/4 test suites)**
- `npm run typecheck`: **✓ PASSED (0 TypeScript errors across all workspaces)**
- `node scripts/doctor.mjs`: **✓ PASSED**

---

## 7. Readiness for PHASE 07
**`READY FOR PHASE 07: HOME DASHBOARD & SUBJECT EXPLORATION`**  
Student profiles, academic personalization, and onboarding gates are completely locked and ready to drive the Home screen experience.
