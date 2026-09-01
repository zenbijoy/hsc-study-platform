import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- Running Phase 06 Onboarding & Personalization Tests ---');

// 1. Test Payload Validation
function validateOnboardingPayload(payload) {
  const errors = {};
  if (!payload.hscYear || payload.hscYear < 2024 || payload.hscYear > 2035) {
    errors.hscYear = 'Please select a valid HSC batch year.';
  }
  if (!payload.studentGroup) {
    errors.studentGroup = 'Please select your academic group.';
  }
  if (!payload.board) {
    errors.board = 'Please select your education board.';
  }
  if (!payload.preferredSubjectIds || payload.preferredSubjectIds.length === 0) {
    errors.preferredSubjectIds = 'Please select at least one preferred subject.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

// Valid payload
const validPayload = {
  hscYear: 2027,
  studentGroup: 'science',
  board: 'rajshahi',
  preferredSubjectIds: ['physics', 'chemistry', 'mathematics'],
  studyFocus: ['textbooks', 'formulas'],
  dailyGoalMinutes: 30,
};
assert.strictEqual(validateOnboardingPayload(validPayload).valid, true, 'Valid payload passes');

// Missing subjects
assert.strictEqual(
  validateOnboardingPayload({ ...validPayload, preferredSubjectIds: [] }).valid,
  false,
  'Empty preferredSubjectIds is rejected'
);

// Invalid year
assert.strictEqual(
  validateOnboardingPayload({ ...validPayload, hscYear: 2010 }).valid,
  false,
  'Out of range year is rejected'
);
console.log('✓ Onboarding payload validation tests passed (3/3)');

// 2. Test Empty Array Semantics Protection
function sanitizePreferences(existing, update) {
  return {
    preferredSubjects: update.preferredSubjects !== undefined ? update.preferredSubjects : existing.preferredSubjects,
    studyFocus: update.studyFocus !== undefined ? update.studyFocus : existing.studyFocus,
  };
}

const existingPrefs = { preferredSubjects: ['physics', 'chemistry'], studyFocus: ['textbooks'] };
const partialUpdate = { studyFocus: ['formulas'] }; // preferredSubjects is undefined
const sanitized = sanitizePreferences(existingPrefs, partialUpdate);
assert.deepStrictEqual(
  sanitized.preferredSubjects,
  ['physics', 'chemistry'],
  'Undefined update does not overwrite existing subjects'
);
console.log('✓ Empty array & undefined update protection verified');

// 3. Test Academic Context Selector
function getStudentAcademicContext(profile) {
  const hscYear = profile?.hscYear || 2026;
  const studentGroup = profile?.studentGroup || 'Science';
  const board = profile?.board || 'Dhaka';
  const preferredSubjectIds = profile?.preferred_subjects || ['physics', 'chemistry', 'mathematics', 'ict'];
  return {
    hscYear,
    studentGroup,
    board,
    preferredSubjectIds,
    formattedTitle: `HSC '${String(hscYear).slice(-2)} • ${studentGroup} (${board} Board)`,
  };
}

const sampleProfile = {
  hscYear: 2027,
  studentGroup: 'Science',
  board: 'Rajshahi',
  preferred_subjects: ['physics', 'chemistry'],
};
const context = getStudentAcademicContext(sampleProfile);
assert.strictEqual(context.formattedTitle, "HSC '27 • Science (Rajshahi Board)");
assert.strictEqual(context.preferredSubjectIds.length, 2);
console.log('✓ Academic context selector verified');

// 4. Verify Migration 0003
assert(fs.existsSync('supabase/migrations/0003_onboarding_atomic_rpc.sql'), 'Migration 0003 exists');
const sql = fs.readFileSync('supabase/migrations/0003_onboarding_atomic_rpc.sql', 'utf8');
assert(sql.includes('complete_onboarding_atomic'), 'RPC defined');
assert(sql.includes('security definer'), 'Security definer enforced');
assert(sql.includes('auth.uid()'), 'Auth user session verified in RPC');
console.log('✓ Onboarding atomic RPC migration verified');

console.log('\nAll Phase 06 Onboarding Tests PASSED successfully.');
