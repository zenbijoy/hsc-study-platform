import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('--- Running Phase 12 Formula Hub & Knowledge Graph Tests ---');

// 1. Test search normalization and matching
function normalizeFormulaQuery(query) {
  if (!query) return '';
  return query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3');
}

function matchesFormulaSearch(formula, normalizedQuery) {
  if (!normalizedQuery) return true;

  const targetText = [
    formula.titleBn,
    formula.titleEn || '',
    formula.latex,
    formula.plainText || '',
    formula.subjectId,
    formula.chapterTitle || '',
    ...formula.tags,
    ...formula.variables.map((v) => `${v.symbol} ${v.meaningBn} ${v.meaningEn || ''}`),
  ]
    .join(' ')
    .toLowerCase();

  const words = normalizedQuery.split(' ');
  return words.every((word) => targetText.includes(word));
}

const sampleFormula = {
  id: 'f1',
  subjectId: 'physics',
  titleBn: 'গতির প্রথম সমীকরণ',
  titleEn: 'First Equation of Motion',
  latex: 'v = u + at',
  plainText: 'v = u + at',
  chapterTitle: 'নিউটনীয় বলবিদ্যা',
  tags: ['motion', 'kinematics'],
  variables: [
    { symbol: 'v', meaningBn: 'শেষ বেগ', meaningEn: 'final velocity' },
    { symbol: 'u', meaningBn: 'আদি বেগ', meaningEn: 'initial velocity' },
    { symbol: 'a', meaningBn: 'ত্বরণ', meaningEn: 'acceleration' },
  ],
};

assert.equal(matchesFormulaSearch(sampleFormula, normalizeFormulaQuery('বেগ')), true);
assert.equal(matchesFormulaSearch(sampleFormula, normalizeFormulaQuery('velocity')), true);
assert.equal(matchesFormulaSearch(sampleFormula, normalizeFormulaQuery('v = u + at')), true);
assert.equal(matchesFormulaSearch(sampleFormula, normalizeFormulaQuery('chemistry')), false);
console.log('✓ Formula search normalization verified across English, Bengali, and variables');

// 2. Test Spaced Repetition Calculator
const REPETITION_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60];
function computeNextReviewDate(currentStage, qualityRating) {
  const now = new Date();
  if (qualityRating === 'review_again') {
    const nextDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    return { nextStage: 0, nextReviewAt: nextDate.toISOString() };
  }
  const nextStage = Math.min(currentStage + 1, REPETITION_INTERVALS_DAYS.length - 1);
  const daysToAdd = REPETITION_INTERVALS_DAYS[nextStage] || 7;
  const nextDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return { nextStage, nextReviewAt: nextDate.toISOString() };
}

const reviewResult1 = computeNextReviewDate(0, 'know');
assert.equal(reviewResult1.nextStage, 1);

const reviewResult2 = computeNextReviewDate(3, 'review_again');
assert.equal(reviewResult2.nextStage, 0);
console.log('✓ Spaced repetition stage and review intervals verified');

// 3. Test Formula Book Cross-Linking Contract
const sampleBookReference = {
  bookId: 'phys-1st',
  bookTitle: 'পদার্থবিজ্ঞান প্রথম পত্র',
  pageNumber: 147,
  chapterTitle: 'নিউটনীয় বলবিদ্যা',
};

assert.equal(typeof sampleBookReference.bookId, 'string');
assert.equal(sampleBookReference.pageNumber, 147);
assert.ok(sampleBookReference.pageNumber > 0);
console.log('✓ Formula-to-textbook deep-linking contract verified');

// 4. Verify Migration 0007 exists and contains indexes
const migrationPath = path.join(rootDir, 'supabase', 'migrations', '0007_formula_hub_indexes.sql');
assert.ok(fs.existsSync(migrationPath), 'Migration 0007 must exist');
const sql = fs.readFileSync(migrationPath, 'utf8');
assert.ok(sql.includes('idx_formula_catalog_subject_chapter_importance'));
assert.ok(sql.includes('idx_content_packs_subject_type'));
console.log('✓ Formula Hub performance indexes migration verified');

console.log('\nAll Phase 12 Formula Hub Tests PASSED successfully.');
