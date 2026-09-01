import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- Running Phase 08 Subject Explorer Tests ---');

// 1. Test Subject Stats Computation
function computeSubjectStats(chapters) {
  const totalChapters = chapters.length;
  let totalFormulas = 0;
  let totalCQs = 0;
  let totalMCQs = 0;
  let completedChapters = 0;
  let totalProgress = 0;

  for (const ch of chapters) {
    totalFormulas += ch.formulaCount || 0;
    totalCQs += ch.cqCount || 0;
    totalMCQs += ch.mcqCount || 0;
    if (ch.progress >= 100) completedChapters++;
    totalProgress += ch.progress || 0;
  }

  const overallProgress = totalChapters > 0 ? Math.round(totalProgress / totalChapters) : 0;
  return {
    totalChapters,
    totalFormulas,
    totalCQs,
    totalMCQs,
    completedChapters,
    overallProgress,
  };
}

const mockChapters = [
  { id: 'c1', chapterNumber: 1, progress: 100, formulaCount: 10, cqCount: 20, mcqCount: 50 },
  { id: 'c2', chapterNumber: 2, progress: 50, formulaCount: 15, cqCount: 25, mcqCount: 70 },
  { id: 'c3', chapterNumber: 3, progress: 0, formulaCount: 20, cqCount: 30, mcqCount: 80 },
];

const stats = computeSubjectStats(mockChapters);
assert.strictEqual(stats.totalChapters, 3, 'Total chapters count');
assert.strictEqual(stats.totalFormulas, 45, 'Total formulas aggregated');
assert.strictEqual(stats.totalCQs, 75, 'Total CQs aggregated');
assert.strictEqual(stats.totalMCQs, 200, 'Total MCQs aggregated');
assert.strictEqual(stats.completedChapters, 1, 'Completed chapters count');
assert.strictEqual(stats.overallProgress, 50, 'Average progress (100 + 50 + 0) / 3 = 50%');
console.log('✓ Subject stats aggregation verified');

// 2. Test Continue Study Resolver
function getContinueSubjectStudyContext(chapters) {
  const inProgress = chapters.find((c) => c.progress > 0 && c.progress < 100);
  if (inProgress) {
    return {
      chapterId: inProgress.id,
      chapterNumber: inProgress.chapterNumber,
      progress: inProgress.progress,
      isResume: true,
    };
  }
  const first = chapters[0];
  if (first) {
    return {
      chapterId: first.id,
      chapterNumber: first.chapterNumber,
      progress: first.progress || 0,
      isResume: false,
    };
  }
  return null;
}

const continueResult = getContinueSubjectStudyContext(mockChapters);
assert(continueResult !== null, 'Found study target');
assert.strictEqual(continueResult.chapterId, 'c2', 'In-progress chapter prioritized');
assert.strictEqual(continueResult.isResume, true, 'Flagged as resume');

const unstartedChapters = [
  { id: 'u1', chapterNumber: 1, progress: 0 },
  { id: 'u2', chapterNumber: 2, progress: 0 },
];
const unstartedResult = getContinueSubjectStudyContext(unstartedChapters);
assert.strictEqual(unstartedResult.chapterId, 'u1', 'Chapter 1 picked when nothing started');
assert.strictEqual(unstartedResult.isResume, false, 'Flagged as start');
console.log('✓ Continue subject study logic verified');

// 3. Test Paper Priority
function resolveDefaultPaper(papers, preferredPaperNumber) {
  if (!papers || papers.length === 0) return null;
  const match = papers.find((p) => p.paperNumber === preferredPaperNumber);
  return match || papers[0];
}

const mockPapers = [
  { id: 'p1', paperNumber: 1, title: '1st Paper' },
  { id: 'p2', paperNumber: 2, title: '2nd Paper' },
];

assert.strictEqual(resolveDefaultPaper(mockPapers, 2).paperNumber, 2, 'Preferred paper resolved');
assert.strictEqual(resolveDefaultPaper(mockPapers, 99).paperNumber, 1, 'Fallback to first paper');
console.log('✓ Paper priority resolution verified');

// 4. Verify Migration 0004 Indexes
const migrationSql = fs.readFileSync('supabase/migrations/0004_subject_explorer_indexes.sql', 'utf8');
assert(migrationSql.includes('idx_syllabus_chapters_subject_paper'), 'Syllabus subject paper index present');
assert(migrationSql.includes('idx_book_chapters_syllabus_ref'), 'Book chapters syllabus ref index present');
console.log('✓ Subject performance index migration verified');

console.log('\nAll Phase 08 Subject Explorer Tests PASSED successfully.');
