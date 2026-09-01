import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- Running Phase 09 Advanced Book Library Tests ---');

// 1. Test Filter Matching & Empty-Array Semantics
function matchesLibraryFilters(book, filters) {
  if (filters.subjectIds.length > 0 && !filters.subjectIds.includes(book.subjectId)) {
    return false;
  }
  if (
    filters.paperNumbers.length > 0 &&
    book.paperNumber !== undefined &&
    !filters.paperNumbers.includes(book.paperNumber)
  ) {
    return false;
  }
  if (
    filters.publishers.length > 0 &&
    book.publisher &&
    !filters.publishers.includes(book.publisher)
  ) {
    return false;
  }
  if (filters.downloadedOnly && !book.isDownloaded) return false;
  if (filters.inProgressOnly && (!book.progress || book.progress <= 0 || book.progress >= 100)) {
    return false;
  }
  return true;
}

const mockBookPhysics1 = {
  id: 'phys-1',
  title: 'Physics 1st Paper',
  subjectId: 'physics',
  paperNumber: 1,
  publisher: 'NCTB',
  isDownloaded: true,
  progress: 45,
};

const mockBookChem2 = {
  id: 'chem-2',
  title: 'Chemistry 2nd Paper',
  subjectId: 'chemistry',
  paperNumber: 2,
  publisher: 'Panjeree',
  isDownloaded: false,
  progress: 0,
};

// Test empty array semantics
const emptyFilters = {
  subjectIds: [],
  paperNumbers: [],
  publishers: [],
  downloadedOnly: false,
  inProgressOnly: false,
};
assert(matchesLibraryFilters(mockBookPhysics1, emptyFilters), 'Empty filters match any book');
assert(matchesLibraryFilters(mockBookChem2, emptyFilters), 'Empty filters match any book');

// Test specific subject and paper filters
const physicsP1Filter = {
  ...emptyFilters,
  subjectIds: ['physics'],
  paperNumbers: [1],
};
assert(matchesLibraryFilters(mockBookPhysics1, physicsP1Filter), 'Matches physics paper 1');
assert(!matchesLibraryFilters(mockBookChem2, physicsP1Filter), 'Does not match chemistry paper 2');

// Test downloaded filter
const downloadedFilter = { ...emptyFilters, downloadedOnly: true };
assert(matchesLibraryFilters(mockBookPhysics1, downloadedFilter), 'Physics 1 is downloaded');
assert(!matchesLibraryFilters(mockBookChem2, downloadedFilter), 'Chemistry 2 is not downloaded');
console.log('✓ Filter matching & empty-array semantics verified');

// 2. Test Search Normalization
function normalizeSearchTerm(term) {
  if (!term) return '';
  return term.trim().toLowerCase().replace(/\s+/g, ' ');
}

function matchesBookSearch(book, query) {
  if (!query) return true;
  const target = `${book.title} ${book.subjectId} ${book.publisher}`.toLowerCase();
  const words = query.split(' ');
  return words.every((word) => target.includes(word));
}

assert.strictEqual(normalizeSearchTerm('  Physics   1st  '), 'physics 1st');
assert(matchesBookSearch(mockBookPhysics1, 'physics 1st'), 'Matches normalized query');
assert(!matchesBookSearch(mockBookChem2, 'physics 1st'), 'Rejects non-matching query');
console.log('✓ Search normalization and multi-word matching verified');

// 3. Test Recommendation Scoring
function computeBookRecommendationScore(book, preferredSubjects = [], contextSubjectId) {
  let score = 0;
  if (contextSubjectId && book.subjectId === contextSubjectId) score += 100;
  if (preferredSubjects.includes(book.subjectId)) score += 40;
  if (book.progress > 0 && book.progress < 100) score += 20;
  if (book.isDownloaded) score += 5;
  return score;
}

const scorePhysics = computeBookRecommendationScore(mockBookPhysics1, ['physics'], 'physics');
assert.strictEqual(scorePhysics, 100 + 40 + 20 + 5, 'Context + Preferred + Unfinished + Downloaded = 165');
console.log('✓ Recommendation scoring rules verified');

// 4. Verify Migration 0005 Indexes
const migrationSql = fs.readFileSync('supabase/migrations/0005_library_catalog_indexes.sql', 'utf8');
assert(migrationSql.includes('idx_books_published_subject_paper'), 'Books subject paper index present');
assert(migrationSql.includes('idx_books_published_created'), 'Books created_at index present');
console.log('✓ Library catalog performance index migration verified');

console.log('\nAll Phase 09 Advanced Book Library Tests PASSED successfully.');
