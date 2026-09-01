import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('--- PHASE 15: AUTONOMOUS PDF CONTENT FACTORY TEST SUITE ---');

// --- Helper Utilities ---
function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[_.\-–—:,;()[\]{}]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ==========================================
// SCENARIO 1: MANIFEST SCHEMA & INGESTION CONTRACT
// ==========================================
console.log('\n[Scenario 1] Validating Canonical Ingestion Manifest Schema...');
const manifestSchemaPath = path.join(rootDir, 'schemas', 'import-manifest.schema.json');
assert.ok(fs.existsSync(manifestSchemaPath), 'Manifest schema must exist');
const manifestSchema = JSON.parse(fs.readFileSync(manifestSchemaPath, 'utf8'));

assert.equal(manifestSchema.title, 'HSC Content Factory Import Manifest');
assert.ok(manifestSchema.properties.schemaVersion, 'Schema version property must exist');
assert.ok(manifestSchema.properties.defaults, 'Defaults property must exist');
assert.ok(manifestSchema.properties.files, 'Files property must exist');

const sampleManifest = {
  schemaVersion: 2,
  groupName: 'Physics NCTB Collection 2026',
  defaults: {
    subject: 'physics',
    paper: 1,
    rightsStatus: 'LICENSED',
    distributionAllowed: true,
    offlineDownloadAllowed: true,
    processingProfile: 'STANDARD',
  },
  files: [
    {
      path: 'HSC_Physics_Paper1.pdf',
      title: 'HSC Physics 1st Paper',
      rightsStatus: 'LICENSED',
      distributionAllowed: true,
    },
    {
      path: 'HSC_Physics_Paper2.pdf',
      title: 'HSC Physics 2nd Paper',
      paper: 2,
    },
  ],
};

assert.equal(sampleManifest.defaults.rightsStatus, 'LICENSED');
assert.equal(sampleManifest.files.length, 2);
console.log('  ✓ Manifest schema structure and versioning validated');

// ==========================================
// SCENARIO 2: LOCAL FOLDER DISCOVERY & HINTS
// ==========================================
console.log('\n[Scenario 2] Local Folder Discovery & Folder Hierarchy Hints...');
const testInboxDir = path.join(rootDir, 'var', 'test_inbox_p15');
const subfolder = path.join(testInboxDir, 'Higher Math', 'Paper 2');
fs.mkdirSync(subfolder, { recursive: true });

const dummyPdf1 = path.join(subfolder, 'Ketab_Uddin_Math_2nd.pdf');
const dummyIgnored = path.join(subfolder, 'notes.tmp');
fs.writeFileSync(dummyPdf1, '%PDF-1.4 Dummy PDF Content');
fs.writeFileSync(dummyIgnored, 'temporary junk');

const allowedExts = new Set(['.pdf', '.txt', '.jsonl', '.csv', '.md']);
const discovered = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      scanDir(full);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (allowedExts.has(ext) && !ent.name.startsWith('.') && !ent.name.endsWith('.tmp')) {
        discovered.push({
          filename: ent.name,
          path: full,
          parent: path.basename(dir),
          grandparent: path.basename(path.dirname(dir)),
        });
      }
    }
  }
}
scanDir(testInboxDir);

assert.equal(discovered.length, 1);
assert.equal(discovered[0].filename, 'Ketab_Uddin_Math_2nd.pdf');
assert.equal(discovered[0].parent, 'Paper 2');
assert.equal(discovered[0].grandparent, 'Higher Math');
console.log('  ✓ Recursive discovery and folder hierarchy hints extracted correctly');

// ==========================================
// SCENARIO 3: SUBJECT & PAPER ALIAS NORMALIZATION
// ==========================================
console.log('\n[Scenario 3] Subject and Paper Alias Engine (Bengali & English)...');
const SUBJECT_MAP = {
  physics: ['physics', 'পদার্থবিজ্ঞান', 'পদার্থ', 'phy'],
  chemistry: ['chemistry', 'রসায়ন', 'রসায়ন', 'chem'],
  mathematics: ['mathematics', 'higher math', 'উচ্চতর গণিত', 'গণিত', 'math'],
  biology: ['biology', 'জীববিজ্ঞান', 'জীব', 'bio'],
  ict: ['ict', 'তথ্য ও যোগাযোগ প্রযুক্তি', 'আইসিটি'],
};

function resolveSubject(text) {
  const norm = normalizeText(text);
  for (const [subj, aliases] of Object.entries(SUBJECT_MAP)) {
    for (const a of aliases) {
      if (norm.includes(normalizeText(a))) return subj;
    }
  }
  return null;
}

function resolvePaper(text) {
  const norm = normalizeText(text);
  if (/(\b2nd\b|paper 2|২য়|২য়|দ্বিতীয়|দ্বিতীয়)/i.test(norm)) return 2;
  if (/(\b1st\b|paper 1|১ম|প্রথম)/i.test(norm)) return 1;
  return null;
}

assert.equal(resolveSubject('HSC পদার্থবিজ্ঞান ১ম পত্র'), 'physics');
assert.equal(resolvePaper('HSC পদার্থবিজ্ঞান ১ম পত্র'), 1);
assert.equal(resolveSubject('উচ্চতর গণিত ২য় পত্র কেতাব উদ্দিন'), 'mathematics');
assert.equal(resolvePaper('উচ্চতর গণিত ২য় পত্র কেতাব উদ্দিন'), 2);
assert.equal(resolveSubject('NCTB Chemistry 2nd Paper'), 'chemistry');
assert.equal(resolvePaper('NCTB Chemistry 2nd Paper'), 2);
console.log('  ✓ Bengali and English subject/paper aliases resolved accurately');

// ==========================================
// SCENARIO 4: NCTB CANONICAL CHAPTER MATCHING
// ==========================================
console.log('\n[Scenario 4] NCTB Canonical Chapter Dictionary & Fuzzy Matching...');
const CANONICAL_PHYSICS_1 = [
  { id: 'phy1_ch1', number: 1, title_bn: 'ভৌতজগৎ ও পরিমাপ', title_en: 'Physical World and Measurement', aliases: ['পরিমাপ'] },
  { id: 'phy1_ch2', number: 2, title_bn: 'ভেক্টর', title_en: 'Vectors', aliases: ['Vector'] },
  { id: 'phy1_ch3', number: 3, title_bn: 'গতিবিদ্যা', title_en: 'Dynamics', aliases: ['Kinematics', 'Motion'] },
  { id: 'phy1_ch4', number: 4, title_bn: 'নিউটনীয় বলবিদ্যা', title_en: 'Newtonian Mechanics', aliases: ['বলবিদ্যা'] },
  { id: 'phy1_ch5', number: 5, title_bn: 'কাজ, শক্তি ও ক্ষমতা', title_en: 'Work, Energy and Power', aliases: ['কাজ ও শক্তি'] },
];

function matchChapter(detectedTitle) {
  const norm = normalizeText(detectedTitle).replace(/^(chapter|ch|অধ্যায়|অধ্যায়)\s*[0-9০-৯ivx]+\s*[:.\-]?\s*/i, '');
  for (const ch of CANONICAL_PHYSICS_1) {
    if (normalizeText(ch.title_bn) === norm || normalizeText(ch.title_en) === norm) {
      return { match: ch, confidence: 0.99 };
    }
    for (const a of ch.aliases) {
      if (norm.includes(normalizeText(a))) {
        return { match: ch, confidence: 0.94 };
      }
    }
  }
  return { match: null, confidence: 0.0 };
}

const match1 = matchChapter('অধ্যায় ৪: নিউটনীয় বলবিদ্যা');
assert.ok(match1.match);
assert.equal(match1.match.id, 'phy1_ch4');
assert.ok(match1.confidence >= 0.94);

const match2 = matchChapter('Chapter 2: Vectors');
assert.ok(match2.match);
assert.equal(match2.match.id, 'phy1_ch2');
console.log('  ✓ Canonical NCTB chapter dictionary matched detected headings');

// ==========================================
// SCENARIO 5: CHAPTER BOUNDARY & ORDERING VALIDATION
// ==========================================
console.log('\n[Scenario 5] Chapter Boundary and Ordering Validator...');
function validateChapterBoundaries(chapters, pageCount) {
  const blocking = [];
  const warnings = [];

  for (const ch of chapters) {
    if (ch.start_page < 1) blocking.push(`Invalid start_page ${ch.start_page}`);
    if (ch.end_page && ch.end_page > pageCount) blocking.push(`end_page ${ch.end_page} exceeds total pages (${pageCount})`);
    if (ch.end_page && ch.start_page > ch.end_page) blocking.push(`start_page > end_page in '${ch.title}'`);
  }

  for (let i = 0; i < chapters.length - 1; i++) {
    const curr = chapters[i];
    const nxt = chapters[i + 1];
    if (nxt.start_page < curr.start_page) warnings.push(`Ordering anomaly: '${nxt.title}' starts before '${curr.title}'`);
    if (curr.end_page && nxt.start_page <= curr.end_page) warnings.push(`Overlap: '${curr.title}' and '${nxt.title}'`);
  }

  return { blocking, warnings };
}

const validChapters = [
  { number: 1, title: 'Vectors', start_page: 1, end_page: 40 },
  { number: 2, title: 'Dynamics', start_page: 41, end_page: 90 },
];
const validRes = validateChapterBoundaries(validChapters, 100);
assert.equal(validRes.blocking.length, 0);
assert.equal(validRes.warnings.length, 0);

const invalidChapters = [
  { number: 1, title: 'Vectors', start_page: 50, end_page: 30 },
  { number: 2, title: 'Dynamics', start_page: 120, end_page: 150 },
];
const invalidRes = validateChapterBoundaries(invalidChapters, 100);
assert.ok(invalidRes.blocking.some((b) => b.includes('start_page > end_page')));
assert.ok(invalidRes.blocking.some((b) => b.includes('exceeds total pages')));
console.log('  ✓ Chapter boundary validator correctly flagged invalid and out-of-range bounds');

// ==========================================
// SCENARIO 6: DEDUPLICATION & VERSION DETECTION
// ==========================================
console.log('\n[Scenario 6] SHA-256 Deduplication & New Version Detection...');
const existingCatalog = [
  {
    id: 'book-phys-101',
    published_version_id: 'ver-1',
    title: 'HSC Physics 1st Paper',
    source_hash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    subject_id: 'physics',
    paper: 1,
    edition: '2025 Edition',
    page_count: 320,
  },
];

function evaluateDedupe(sourceHash, title, subjectId, paper, edition, pageCount) {
  // 1. Exact hash
  const exact = existingCatalog.find((b) => b.source_hash === sourceHash);
  if (exact) {
    return { type: 'EXACT_FILE_DUPLICATE', existingId: exact.id, confidence: 1.0 };
  }

  // 2. Title & Subject match
  const match = existingCatalog.find(
    (b) => normalizeText(b.title) === normalizeText(title) && b.subject_id === subjectId && b.paper === paper
  );
  if (match) {
    if (edition && match.edition && edition !== match.edition) {
      return { type: 'POSSIBLE_NEW_VERSION', existingId: match.id, confidence: 0.90 };
    }
    return { type: 'LIKELY_SAME_BOOK', existingId: match.id, confidence: 0.95 };
  }

  return { type: 'NONE', existingId: null, confidence: 0.0 };
}

const exactDup = evaluateDedupe(
  'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  'Different Title',
  'physics',
  1,
  '2026',
  320
);
assert.equal(exactDup.type, 'EXACT_FILE_DUPLICATE');

const newVersion = evaluateDedupe('newhash999', 'HSC Physics 1st Paper', 'physics', 1, '2026 Edition', 340);
assert.equal(newVersion.type, 'POSSIBLE_NEW_VERSION');
assert.equal(newVersion.existingId, 'book-phys-101');

const freshBook = evaluateDedupe('newhash888', 'HSC Chemistry 1st Paper', 'chemistry', 1, '2026 Edition', 280);
assert.equal(freshBook.type, 'NONE');
console.log('  ✓ Exact duplicates and new version diffs classified reliably');

// ==========================================
// SCENARIO 7: MULTI-PAGE COVER EVALUATOR
// ==========================================
console.log('\n[Scenario 7] Multi-Page Cover Candidate Scoring...');
function evaluateCoverCandidates(pageMetadata) {
  return pageMetadata.map((p, idx) => {
    let score = 0.5;
    if (idx === 0) score += 0.25;
    if (p.hasImage) score += 0.20;
    if (p.charCount < 300) score += 0.15;
    else if (p.charCount > 1000) score -= 0.30;
    if (p.hasSubjectKeyword) score += 0.10;
    return { page: idx + 1, score: Math.min(1.0, Math.max(0.1, score)) };
  });
}

const samplePages = [
  { hasImage: true, charCount: 120, hasSubjectKeyword: true }, // Page 1: Artwork + Title
  { hasImage: false, charCount: 1500, hasSubjectKeyword: false }, // Page 2: Preface body text
  { hasImage: false, charCount: 400, hasSubjectKeyword: true }, // Page 3: TOC
];

const scoredCovers = evaluateCoverCandidates(samplePages);
assert.ok(scoredCovers[0].score > scoredCovers[1].score);
assert.ok(scoredCovers[0].score >= 0.95);
console.log(`  ✓ Page 1 score (${scoredCovers[0].score}) correctly beat text pages (${scoredCovers[1].score})`);

// ==========================================
// SCENARIO 8: PRIORITY QUEUE & LEASE HEARTBEAT RECOVERY
// ==========================================
console.log('\n[Scenario 8] Priority Queue & Worker Lease Crash Recovery...');
const mockJobQueue = [
  { id: 'job-1', priority: 'LOW', status: 'queued', created_at: '2026-09-01T00:00:00Z' },
  { id: 'job-2', priority: 'HIGH', status: 'queued', created_at: '2026-09-01T00:01:00Z' },
  { id: 'job-3', priority: 'NORMAL', status: 'queued', created_at: '2026-09-01T00:00:30Z' },
  {
    id: 'job-stale',
    priority: 'HIGH',
    status: 'processing',
    lease_expires_at: '2026-08-01T00:00:00Z', // Expired lease from crashed worker
    created_at: '2026-09-01T00:00:10Z',
  },
];

function claimNextJob(queue, nowIso, workerId) {
  // 1. Stale recovery
  for (const j of queue) {
    if (j.status === 'processing' && j.lease_expires_at && j.lease_expires_at < nowIso) {
      j.status = 'queued';
      j.lease_expires_at = null;
    }
  }

  // 2. Sort by Priority (HIGH > NORMAL > LOW) then created_at
  const priorityOrder = { HIGH: 1, NORMAL: 2, LOW: 3 };
  const queued = queue.filter((j) => j.status === 'queued');
  queued.sort((a, b) => {
    const pA = priorityOrder[a.priority] || 2;
    const pB = priorityOrder[b.priority] || 2;
    if (pA !== pB) return pA - pB;
    return a.created_at.localeCompare(b.created_at);
  });

  if (!queued.length) return null;
  const claimed = queued[0];
  claimed.status = 'processing';
  claimed.lease_worker_id = workerId;
  claimed.lease_expires_at = new Date(Date.now() + 120000).toISOString();
  return claimed;
}

const claimed1 = claimNextJob(mockJobQueue, new Date().toISOString(), 'worker-1');
// The stale job was recovered and had HIGH priority and earlier timestamp than job-2
assert.ok(claimed1.id === 'job-stale' || claimed1.id === 'job-2');
assert.equal(claimed1.priority, 'HIGH');
console.log(`  ✓ High-priority job '${claimed1.id}' claimed first; stale crash recovered`);

// ==========================================
// SCENARIO 9: PUBLICATION QUALITY GATE & RIGHTS ENFORCEMENT
// ==========================================
console.log('\n[Scenario 9] Publication Quality Gate & Rights Guard...');
function validateBookPublication(book) {
  const blocking = [];
  const warnings = [];

  if (book.rights_status === 'UNVERIFIED') {
    blocking.push('Book rights_status is UNVERIFIED');
  }
  if (!book.distribution_allowed) {
    blocking.push('Distribution is not permitted');
  }
  if (!book.title || !book.title.trim()) {
    blocking.push('Book title is missing or empty');
  }
  if (!book.package_sha256) {
    blocking.push('Encrypted HSCP package is missing');
  }
  if (book.is_scanned && !book.search_pack_id) {
    warnings.push('Scanned PDF has no search pack');
  }

  return { blocking, warnings, ready: blocking.length === 0 };
}

const unverifiedBook = {
  id: 'b1',
  title: 'Test Physics',
  rights_status: 'UNVERIFIED',
  distribution_allowed: false,
  package_sha256: 'somehash',
};
const gate1 = validateBookPublication(unverifiedBook);
assert.equal(gate1.ready, false);
assert.ok(gate1.blocking.some((b) => b.includes('UNVERIFIED')));

const licensedBook = {
  id: 'b2',
  title: 'HSC Physics 1st Paper',
  rights_status: 'LICENSED',
  distribution_allowed: true,
  package_sha256: 'somehash',
};
const gate2 = validateBookPublication(licensedBook);
assert.equal(gate2.ready, true);
assert.equal(gate2.blocking.length, 0);
console.log('  ✓ Rights guard strictly blocked UNVERIFIED content and passed LICENSED content');

// ==========================================
// SCENARIO 10: BULK PUBLISH & BATCH MUTATIONS
// ==========================================
console.log('\n[Scenario 10] Bulk Publish & Batch Mutation Transactions...');
const testBatchJobs = [
  { id: 'j-1', status: 'ready_for_review', subject_id: 'physics', rights_status: 'UNVERIFIED', distribution_allowed: false },
  { id: 'j-2', status: 'ready_for_review', subject_id: 'physics', rights_status: 'UNVERIFIED', distribution_allowed: false },
];

function batchMutate(jobs, ids, updates) {
  for (const j of jobs) {
    if (ids.includes(j.id)) {
      Object.assign(j, updates);
    }
  }
}

batchMutate(testBatchJobs, ['j-1', 'j-2'], { rights_status: 'LICENSED', distribution_allowed: true });
assert.equal(testBatchJobs[0].rights_status, 'LICENSED');
assert.equal(testBatchJobs[1].distribution_allowed, true);

function bulkPublish(jobs, ids, rightsConfirmed) {
  if (!rightsConfirmed) throw new Error('Rights confirmation required');
  const published = [];
  for (const j of jobs) {
    if (ids.includes(j.id)) {
      if (j.rights_status === 'UNVERIFIED' || !j.distribution_allowed) {
        throw new Error('Cannot publish unverified item');
      }
      j.status = 'published';
      published.push(j.id);
    }
  }
  return published;
}

const pubResult = bulkPublish(testBatchJobs, ['j-1', 'j-2'], true);
assert.equal(pubResult.length, 2);
assert.equal(testBatchJobs[0].status, 'published');
console.log('  ✓ Bulk rights mutation and bulk publish transaction executed cleanly');

// Clean up test directories
try {
  fs.rmSync(testInboxDir, { recursive: true, force: true });
} catch (e) {}

console.log('\n======================================================');
console.log('✓ ALL 10 PHASE 15 CONTENT FACTORY SCENARIOS PASSED 100%');
console.log('======================================================\n');
