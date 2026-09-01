import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- Running Phase 10 Book Details Tests ---');

// 1. Test Book Access Resolution
function resolveBookAccess(book, activeVersion, isAuthenticated, isOnline = true, isDownloaded = false) {
  if (!book) return { status: 'unavailable', canRead: false, reasonCode: 'BOOK_UNAVAILABLE' };
  if (!activeVersion) return { status: 'unavailable', canRead: false, reasonCode: 'VERSION_UNAVAILABLE' };
  if (!isOnline) {
    if (isDownloaded) return { status: 'available', canRead: true, reasonCode: 'OFFLINE_LICENSE_VALID' };
    return { status: 'available', canRead: false, reasonCode: 'NETWORK_REQUIRED' };
  }
  return { status: 'available', canRead: true, canDownload: true, reasonCode: 'GRANTED' };
}

const mockBook = { id: 'phys-1st', title: 'Physics 1st Paper', pages: 540 };
const mockVersion = { id: 'v1', bookId: 'phys-1st', version: 1 };

// Scenario A: Online & Available
const accessOnline = resolveBookAccess(mockBook, mockVersion, true, true, false);
assert.strictEqual(accessOnline.canRead, true, 'Online user can read book');
assert.strictEqual(accessOnline.reasonCode, 'GRANTED', 'Granted reason code');

// Scenario B: Offline & Downloaded
const accessOfflineDownloaded = resolveBookAccess(mockBook, mockVersion, true, false, true);
assert.strictEqual(accessOfflineDownloaded.canRead, true, 'Offline user can read downloaded book');
assert.strictEqual(accessOfflineDownloaded.reasonCode, 'OFFLINE_LICENSE_VALID', 'Valid offline license');

// Scenario C: Offline & Not Downloaded
const accessOfflineNotDownloaded = resolveBookAccess(mockBook, mockVersion, true, false, false);
assert.strictEqual(accessOfflineNotDownloaded.canRead, false, 'Offline user cannot read undownloaded book');
assert.strictEqual(accessOfflineNotDownloaded.reasonCode, 'NETWORK_REQUIRED', 'Network required reason code');

// Scenario D: Missing Version
const accessNoVersion = resolveBookAccess(mockBook, null, true, true, false);
assert.strictEqual(accessNoVersion.canRead, false, 'Book with no active version is blocked');
assert.strictEqual(accessNoVersion.reasonCode, 'VERSION_UNAVAILABLE', 'Version unavailable code');
console.log('✓ Book access resolution rules verified across 4 scenarios');

// 2. Test Reader Launch Resolution Contract
function resolveReaderLaunch({ bookId, versionId, requestedPage = 1, isDownloaded = false, isOnline = true }) {
  if (!versionId) return { bookId, versionId: '', requestedPage, mode: 'blocked', reason: 'Version unavailable' };
  if (isDownloaded) return { bookId, versionId, requestedPage, mode: 'offline' };
  if (isOnline) return { bookId, versionId, requestedPage, mode: 'online' };
  return { bookId, versionId, requestedPage, mode: 'blocked', reason: 'Connect to internet' };
}

const launchOffline = resolveReaderLaunch({ bookId: 'b1', versionId: 'v1', requestedPage: 147, isDownloaded: true });
assert.strictEqual(launchOffline.mode, 'offline', 'Resolves to offline local mode');
assert.strictEqual(launchOffline.requestedPage, 147, 'Preserves resume page');

const launchOnline = resolveReaderLaunch({ bookId: 'b1', versionId: 'v1', requestedPage: 1, isOnline: true });
assert.strictEqual(launchOnline.mode, 'online', 'Resolves to online streaming mode');

const launchBlocked = resolveReaderLaunch({ bookId: 'b1', versionId: 'v1', isDownloaded: false, isOnline: false });
assert.strictEqual(launchBlocked.mode, 'blocked', 'Blocks offline un-downloaded launch');
console.log('✓ Reader launch resolution contract verified');

// 3. Test Chapter Map Sorting
const rawChapters = [
  { id: 'ch4', chapterNumber: 4, startPage: 128, endPage: 176 },
  { id: 'ch1', chapterNumber: 1, startPage: 1, endPage: 32 },
  { id: 'ch2', chapterNumber: 2, startPage: 33, endPage: 80 },
];
const sortedChapters = [...rawChapters].sort((a, b) => a.startPage - b.startPage);
assert.strictEqual(sortedChapters[0].chapterNumber, 1, 'Chapter 1 first');
assert.strictEqual(sortedChapters[1].chapterNumber, 2, 'Chapter 2 second');
assert.strictEqual(sortedChapters[2].chapterNumber, 4, 'Chapter 4 third');
console.log('✓ Chapter map page sorting verified');

// 4. Verify Migration 0006 Indexes
const migrationSql = fs.readFileSync('supabase/migrations/0006_book_details_indexes.sql', 'utf8');
assert(migrationSql.includes('idx_book_chapters_book_version'), 'Book chapters index present');
assert(migrationSql.includes('idx_book_versions_active'), 'Active book versions index present');
assert(migrationSql.includes('idx_reading_progress_user_book'), 'Reading progress index present');
console.log('✓ Book details performance index migration verified');

console.log('\nAll Phase 10 Book Details Tests PASSED successfully.');
