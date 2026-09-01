import assert from 'node:assert';

console.log('--- Running Phase 11 Secure Reader Tests ---');

// 1. Test Reader Theme Palettes
const READER_THEMES = {
  original: { background: '#FFFFFF', toolbar: '#0B151E', accent: '#57E0B7' },
  sepia: { background: '#1C1712', toolbar: '#2A221B', accent: '#FFB86C' },
  dark: { background: '#05090D', toolbar: '#0B151E', accent: '#57E0B7' },
  midnight: { background: '#081018', toolbar: '#0F1E2C', accent: '#6CB7FF' },
};

function getReaderThemePalette(mode) {
  return READER_THEMES[mode] || READER_THEMES.dark;
}

assert.strictEqual(getReaderThemePalette('sepia').background, '#1C1712', 'Sepia background palette correct');
assert.strictEqual(getReaderThemePalette('midnight').accent, '#6CB7FF', 'Midnight accent palette correct');
assert.strictEqual(getReaderThemePalette('unknown').background, '#05090D', 'Default dark fallback correct');
console.log('✓ Reader theme palettes verified (4 modes)');

// 2. Test In-Book Multi-Lingual Search
function searchInsideBook(query, chapters) {
  if (!query || query.trim().length < 2) return [];
  const normalized = query.trim().toLowerCase();
  const results = [];
  chapters.forEach((ch) => {
    if (ch.title.toLowerCase().includes(normalized) || (ch.banglaTitle && ch.banglaTitle.toLowerCase().includes(normalized))) {
      results.push({
        id: `search-${ch.id}`,
        pageNumber: ch.startPage,
        chapterTitle: ch.title,
        snippet: `Chapter ${ch.chapterNumber}: ${ch.title}`,
      });
    }
  });
  return results;
}

const mockChapters = [
  { id: 'ch1', chapterNumber: 1, title: 'Physical World and Measurement', banglaTitle: 'ভৌতজগৎ ও পরিমাপ', startPage: 1 },
  { id: 'ch2', chapterNumber: 2, title: 'Vectors', banglaTitle: 'ভেক্টর', startPage: 33 },
  { id: 'ch4', chapterNumber: 4, title: 'Newtonian Mechanics', banglaTitle: 'নিউটনীয় বলবিদ্যা', startPage: 128 },
];

const searchEnglish = searchInsideBook('vectors', mockChapters);
assert.strictEqual(searchEnglish.length, 1, 'Found 1 English match');
assert.strictEqual(searchEnglish[0].pageNumber, 33, 'Matches vector start page');

const searchBengali = searchInsideBook('ভেক্টর', mockChapters);
assert.strictEqual(searchBengali.length, 1, 'Found 1 Bengali match');
assert.strictEqual(searchBengali[0].pageNumber, 33, 'Matches Bengali vector start page');

const searchShort = searchInsideBook('a', mockChapters);
assert.strictEqual(searchShort.length, 0, 'Rejects queries shorter than 2 characters');
console.log('✓ In-book search verified across English and Bengali');

// 3. Test Page Clamping
function clampPage(page, totalPages) {
  return Math.max(1, Math.min(page, totalPages));
}
assert.strictEqual(clampPage(-5, 540), 1, 'Clamps negative page to 1');
assert.strictEqual(clampPage(700, 540), 540, 'Clamps overflowing page to 540');
assert.strictEqual(clampPage(147, 540), 147, 'Valid page unchanged');
console.log('✓ Page boundary clamping verified');

// 4. Test Reader Launch Modes
function resolveReaderLaunch({ bookId, versionId, isDownloaded, isOnline }) {
  if (!versionId) return { mode: 'blocked', reason: 'Version unavailable' };
  if (isDownloaded) return { mode: 'offline', versionId };
  if (isOnline) return { mode: 'online', versionId };
  return { mode: 'blocked', reason: 'Connect to internet' };
}

assert.strictEqual(resolveReaderLaunch({ bookId: 'b1', versionId: 'v1', isDownloaded: true }).mode, 'offline');
assert.strictEqual(resolveReaderLaunch({ bookId: 'b1', versionId: 'v1', isDownloaded: false, isOnline: true }).mode, 'online');
assert.strictEqual(resolveReaderLaunch({ bookId: 'b1', versionId: 'v1', isDownloaded: false, isOnline: false }).mode, 'blocked');
console.log('✓ Reader launch resolution modes verified');

console.log('\nAll Phase 11 Secure Reader Tests PASSED successfully.');
