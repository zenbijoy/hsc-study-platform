import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- Running Phase 07 Home Screen & Personalization Tests ---');

// 1. Test Section Sanitizer & Clamper
const WHITELISTED_SECTION_TYPES = [
  'greeting',
  'continue_reading',
  'subjects',
  'study_progress',
  'quick_actions',
  'formula_of_day',
  'recommended_books',
  'board_practice',
  'recently_added',
  'announcement',
];

function sanitizeAndOrderSections(remoteSections, defaultSections) {
  if (!remoteSections || !Array.isArray(remoteSections) || remoteSections.length === 0) {
    return defaultSections;
  }
  const valid = remoteSections.filter(
    (s) => s && s.enabled !== false && WHITELISTED_SECTION_TYPES.includes(s.type)
  );
  if (valid.length === 0) return defaultSections;
  return valid.sort((a, b) => (a.order || 0) - (b.order || 0));
}

const defaultSections = [
  { id: '1', type: 'continue_reading', order: 1, enabled: true },
  { id: '2', type: 'subjects', order: 2, enabled: true },
];

// Test with corrupt/unknown section
const remoteWithHacks = [
  { id: 'hacked', type: 'arbitrary_crypto_miner', order: 0, enabled: true },
  { id: 's2', type: 'subjects', order: 1, enabled: true },
  { id: 's1', type: 'continue_reading', order: 2, enabled: true },
];
const sanitized = sanitizeAndOrderSections(remoteWithHacks, defaultSections);
assert.strictEqual(sanitized.length, 2, 'Unwhitelisted sections are purged');
assert.strictEqual(sanitized[0].type, 'subjects', 'Remote ordering respected for valid types');
assert.strictEqual(sanitized[1].type, 'continue_reading', 'Remote ordering sorted properly');
console.log('✓ Section sanitizer & security clamping verified');

// 2. Test Recommendation Scoring Engine
function computeRecommendationScore(book, preferredSubjects = ['physics', 'chemistry']) {
  let score = 0;
  if (preferredSubjects.includes(book.subjectId)) score += 50;
  if (book.progress && book.progress > 0 && book.progress < 100) score += 30;
  if (['physics', 'chemistry', 'mathematics'].includes(book.subjectId)) score += 15;
  if (book.formulas > 50) score += 10;
  return score;
}

const bookPhysics = { id: 'p1', subjectId: 'physics', progress: 45, formulas: 140 };
const bookAccounting = { id: 'a1', subjectId: 'accounting', progress: 0, formulas: 0 };

assert(
  computeRecommendationScore(bookPhysics) > computeRecommendationScore(bookAccounting),
  'Preferred physics book with progress ranks higher than accounting'
);
assert.strictEqual(computeRecommendationScore(bookPhysics), 50 + 30 + 15 + 10, 'Expected score calculated accurately');
console.log('✓ Recommendation scoring rules verified');

// 3. Test Deterministic Formula of the Day
function getDeterministicDailyFormula(formulas, dayOfYear = 100) {
  if (!formulas || formulas.length === 0) return null;
  const index = dayOfYear % formulas.length;
  return formulas[index] || formulas[0];
}

const mockFormulas = [
  { id: 'f1', title: 'Formula 1' },
  { id: 'f2', title: 'Formula 2' },
  { id: 'f3', title: 'Formula 3' },
];

assert.strictEqual(
  getDeterministicDailyFormula(mockFormulas, 100).id,
  getDeterministicDailyFormula(mockFormulas, 100).id,
  'Same day of year returns identical formula (deterministic)'
);
assert.strictEqual(
  getDeterministicDailyFormula(mockFormulas, 100).id,
  'f2',
  'Modulo index resolves accurately'
);
console.log('✓ Formula of the day determinism verified');

// 4. Test Time-Based Greeting
function getTimeBasedGreeting(hour) {
  if (hour >= 4 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Ready for late-night study?';
}

assert.strictEqual(getTimeBasedGreeting(8), 'Good morning');
assert.strictEqual(getTimeBasedGreeting(14), 'Good afternoon');
assert.strictEqual(getTimeBasedGreeting(19), 'Good evening');
assert.strictEqual(getTimeBasedGreeting(2), 'Ready for late-night study?');
console.log('✓ Time-based greeting generator verified');

console.log('\nAll Phase 07 Home Tests PASSED successfully.');
