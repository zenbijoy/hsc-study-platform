export const INGEST_API = process.env.NEXT_PUBLIC_INGEST_API_URL ?? 'http://localhost:8787';

export type RightsStatus =
  | 'OWNED'
  | 'LICENSED'
  | 'OPEN_LICENSE'
  | 'PUBLIC_DOMAIN'
  | 'PUBLISHER_AUTHORIZED'
  | 'INTERNAL_ONLY'
  | 'UNVERIFIED';

export type JobPriority = 'HIGH' | 'NORMAL' | 'LOW';
export type ProcessingProfile = 'FAST' | 'STANDARD' | 'DEEP';
export type BookStatus = 'DRAFT' | 'ACTIVE' | 'UNPUBLISHED' | 'ARCHIVED';
export type BookVersionStatus = 'PROCESSING' | 'REVIEW_REQUIRED' | 'READY' | 'ACTIVE' | 'INACTIVE' | 'FAILED';
export type ArtifactStatus = 'READY' | 'PROCESSING' | 'FAILED' | 'STALE' | 'UNAVAILABLE' | 'CORRUPTED';
export type SectionType = 'FRONT_MATTER' | 'CHAPTER' | 'APPENDIX' | 'INDEX' | 'REFERENCE' | 'OTHER';

export type ChapterCandidate = {
  number: number;
  title: string;
  start_page: number;
  end_page?: number;
  confidence: number;
  source: string;
  canonical_chapter_id?: string;
  manual_override?: boolean;
  section_type?: SectionType;
};

export type CoverCandidate = {
  page_number: number;
  score: number;
  preview_url?: string;
  is_selected: boolean;
  reasons?: string[];
};

export type DuplicateEvaluation = {
  duplicate_type: 'NONE' | 'EXACT_FILE_DUPLICATE' | 'LIKELY_SAME_BOOK' | 'POSSIBLE_NEW_VERSION';
  existing_book_id?: string;
  existing_version_id?: string;
  existing_book_title?: string;
  confidence: number;
  reason: string;
};

export type BookVersion = {
  id: string;
  book_id: string;
  version: number;
  edition_label?: string;
  page_count: number;
  package_sha256?: string;
  storage_provider: string;
  delivery_url?: string;
  status: BookVersionStatus;
  is_active: boolean;
  search_status: ArtifactStatus;
  hscp_status: ArtifactStatus;
  search_pack_id?: string;
  search_indexed_pages: number;
  text_ratio: number;
  is_scanned: boolean;
  cover_candidates?: CoverCandidate[];
  selected_cover_page?: number;
  chapter_map_revision?: number;
  created_at: string;
};

export type BookChapterRevision = {
  id: string;
  book_id: string;
  book_version_id: string;
  revision_number: number;
  chapters: ChapterCandidate[];
  source: string;
  status: string;
  created_by?: string;
  created_at: string;
};

export type ContentIssue = {
  id: string;
  book_id: string;
  book_version_id?: string;
  page_number?: number;
  category: string;
  priority: string;
  status: string;
  message: string;
  reporter_email?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at?: string;
};

export type BookAuditEntry = {
  id: string;
  book_id: string;
  book_version_id?: string;
  action: string;
  actor_email: string;
  before_state: Record<string, any>;
  after_state: Record<string, any>;
  reason?: string;
  created_at: string;
};

export type BookRelationship = {
  id: string;
  book_id: string;
  book_version_id: string;
  entity_type: 'formula' | 'cq' | 'mcq' | 'concept';
  entity_id: string;
  page_number: number;
  chapter_number?: number;
  relationship_type: string;
  status: string;
  created_at: string;
};

export type Book = {
  id: string;
  title: string;
  subtitle?: string;
  subject_id: string;
  paper: number;
  publisher?: string;
  edition?: string;
  status: BookStatus;
  access_mode: string;
  is_protected: boolean;
  is_published: boolean;
  published_version_id?: string;
  active_version_id?: string;
  chapter_count: number;
  formula_count: number;
  cq_count?: number;
  mcq_count?: number;
  page_count: number;
  cover_url?: string;
  cover_thumbnail_url?: string;
  source_hash?: string;
  package_sha256?: string;
  is_scanned?: boolean;
  text_ratio?: number;
  rights_status: RightsStatus;
  distribution_allowed: boolean;
  online_reading_allowed: boolean;
  offline_download_allowed: boolean;
  classification_confidence?: Record<string, number>;
  classification_provenance?: Record<string, string>;
  metadata_locked_by_admin?: boolean;
  chapters_locked_by_admin?: boolean;
  tags?: string[];
  academic_year?: string;
  description?: string;
  authors?: string[];
  import_group_id?: string;
  first_published_at?: string;
  current_version_published_at?: string;
  featured?: boolean;
  sort_order?: number;
  version_token?: number;
  versions?: BookVersion[];
  active_version?: BookVersion;
  chapters?: ChapterCandidate[];
  chapter_revisions?: BookChapterRevision[];
  issues?: ContentIssue[];
  audit_log?: BookAuditEntry[];
  relationships?: BookRelationship[];
  blocking_issues?: string[];
  warnings?: string[];
  health?: Record<string, string>;
  reader_ready?: boolean;
  search_ready?: boolean;
  chapter_map_ready?: boolean;
  created_at: string;
  updated_at: string;
};

export type QualitySummary = {
  total_books: number;
  published_books: number;
  draft_books: number;
  missing_covers: number;
  missing_chapters: number;
  broken_packages: number;
  search_failures: number;
  rights_unverified: number;
  open_reports: number;
};

export type ImportJob = {
  id: string;
  source_name: string;
  source_type: string;
  source_hash?: string;
  status: string;
  stage: string;
  priority?: JobPriority;
  profile?: ProcessingProfile;
  import_group_id?: string;
  progress: number;
  total_items: number;
  processed_items: number;
  failed_items: number;
  detected_chapters?: number;
  detected_formulas?: number;
  detected_cqs?: number;
  rights_status?: RightsStatus;
  distribution_allowed?: boolean;
  offline_download_allowed?: boolean;
  subject_id?: string;
  paper_number?: number;
  detected_title?: string;
  detected_publisher?: string;
  detected_edition?: string;
  confidence_scores?: Record<string, number>;
  provenance?: Record<string, string>;
  cover_candidates?: CoverCandidate[];
  selected_cover_page?: number;
  duplicate_info?: DuplicateEvaluation;
  blocking_issues?: string[];
  warnings?: string[];
  message?: string;
  result?: {
    book?: Book;
    packs?: any[];
    duplicate_items_removed?: number;
    ocr_recommended?: boolean;
    duplicate_info?: DuplicateEvaluation;
    blocking_issues?: string[];
    warnings?: string[];
  };
  created_at: string;
  updated_at?: string;
};

export type ImportGroup = {
  id: string;
  name: string;
  source_type: string;
  status: string;
  total_files: number;
  processed_files: number;
  published_files: number;
  failed_files: number;
  created_by?: string;
  created_at: string;
  updated_at?: string;
};

export type DiscoveryCandidate = {
  source_type: string;
  source_path: string;
  filename: string;
  size: number;
  modified_time?: string;
  drive_file_id?: string;
  hints?: Record<string, any>;
  status: string;
  source_hash?: string;
};

export type DiscoverySummary = {
  source_type: string;
  new_files: number;
  already_imported: number;
  changed_files: number;
  unsupported: number;
  candidates: DiscoveryCandidate[];
};

// --- Book CMS API Functions ---

export async function fetchBooks(params?: {
  offset?: number;
  limit?: number;
  search?: string;
  status?: string;
  subject_id?: string;
  paper?: number;
  rights_status?: string;
  reader_ready?: boolean;
  search_ready?: boolean;
  chapter_map_ready?: boolean;
  sort_by?: string;
  sort_order?: string;
}): Promise<{ items: Book[]; total: number; offset: number; limit: number }> {
  const query = new URLSearchParams();
  if (params?.offset !== undefined) query.set('offset', String(params.offset));
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.status && params.status !== 'all') query.set('status', params.status);
  if (params?.subject_id && params.subject_id !== 'all') query.set('subject_id', params.subject_id);
  if (params?.paper && params.paper !== 0) query.set('paper', String(params.paper));
  if (params?.rights_status && params.rights_status !== 'all') query.set('rights_status', params.rights_status);
  if (params?.reader_ready !== undefined) query.set('reader_ready', String(params.reader_ready));
  if (params?.search_ready !== undefined) query.set('search_ready', String(params.search_ready));
  if (params?.chapter_map_ready !== undefined) query.set('chapter_map_ready', String(params.chapter_map_ready));
  if (params?.sort_by) query.set('sort_by', params.sort_by);
  if (params?.sort_order) query.set('sort_order', params.sort_order);

  const res = await fetch(`${INGEST_API}/v1/books?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Worker returned ${res.status}`);
  return res.json();
}

export async function fetchBook(bookId: string): Promise<Book> {
  const res = await fetch(`${INGEST_API}/v1/books/${bookId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Worker returned ${res.status}`);
  return res.json();
}

export async function updateBook(bookId: string, payload: Partial<Book> & { reason?: string }): Promise<Book> {
  const res = await fetch(`${INGEST_API}/v1/books/${bookId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveChapterRevision(
  bookId: string,
  versionId: string,
  chapters: ChapterCandidate[]
): Promise<BookChapterRevision> {
  const res = await fetch(`${INGEST_API}/v1/books/${bookId}/versions/${versionId}/chapters`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chapters, source: 'ADMIN_MANUAL' }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function publishBookVersion(
  bookId: string,
  versionId: string,
  payload: { rights_confirmed: boolean; rights_status: RightsStatus; distribution_allowed: boolean }
): Promise<{ ok: boolean; book_id: string; published_version_id: string }> {
  const res = await fetch(`${INGEST_API}/v1/books/${bookId}/versions/${versionId}/publish`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function rollbackBook(
  bookId: string,
  targetVersionId: string,
  reason?: string
): Promise<{ ok: boolean; book_id: string; active_version_id: string }> {
  const res = await fetch(`${INGEST_API}/v1/books/${bookId}/rollback`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ target_version_id: targetVersionId, reason }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function unpublishBook(bookId: string, reason?: string): Promise<{ ok: boolean; book_id: string }> {
  const res = await fetch(`${INGEST_API}/v1/books/${bookId}/unpublish`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function archiveBook(bookId: string): Promise<{ ok: boolean; book_id: string }> {
  const res = await fetch(`${INGEST_API}/v1/books/${bookId}/archive`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchPagePreview(
  bookId: string,
  pageNum: number
): Promise<{
  book_id: string;
  page_number: number;
  extracted_text: string;
  ocr_confidence: number;
  has_images: boolean;
  linked_formulas_count: number;
  linked_cq_count: number;
}> {
  const res = await fetch(`${INGEST_API}/v1/books/${bookId}/pages/${pageNum}/preview`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Worker returned ${res.status}`);
  return res.json();
}

export async function testSearchBook(
  bookId: string,
  pageNum: number,
  query: string
): Promise<{
  query: string;
  total_matches: number;
  results: Array<{ page: number; snippet: string; score: number }>;
}> {
  const res = await fetch(`${INGEST_API}/v1/books/${bookId}/pages/${pageNum}/search-test`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchQualitySummary(): Promise<QualitySummary> {
  const res = await fetch(`${INGEST_API}/v1/quality/summary`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Worker returned ${res.status}`);
  return res.json();
}

export async function fetchIssues(bookId?: string, status?: string): Promise<ContentIssue[]> {
  const q = new URLSearchParams();
  if (bookId) q.set('book_id', bookId);
  if (status) q.set('status', status);
  const res = await fetch(`${INGEST_API}/v1/issues?${q.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Worker returned ${res.status}`);
  return res.json();
}

export async function createIssue(payload: Partial<ContentIssue>): Promise<ContentIssue> {
  const res = await fetch(`${INGEST_API}/v1/issues`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateIssue(issueId: string, payload: Partial<ContentIssue>): Promise<ContentIssue> {
  const res = await fetch(`${INGEST_API}/v1/issues/${issueId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --- Import & Job Requests ---

export async function fetchJobs(options?: {
  limit?: number;
  status?: string;
  groupId?: string;
}): Promise<ImportJob[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.status) params.set('status', options.status);
  if (options?.groupId) params.set('group_id', options.groupId);

  const res = await fetch(`${INGEST_API}/v1/content-factory/jobs?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Worker returned ${res.status}`);
  return res.json();
}

export async function fetchJob(id: string): Promise<ImportJob> {
  const res = await fetch(`${INGEST_API}/v1/content-factory/jobs/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Worker returned ${res.status}`);
  return res.json();
}

export async function retryJob(jobId: string, stage?: string): Promise<ImportJob> {
  const params = stage ? `?stage=${encodeURIComponent(stage)}` : '';
  const res = await fetch(`${INGEST_API}/v1/content-factory/jobs/${jobId}/retry${params}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function cancelJob(jobId: string): Promise<ImportJob> {
  const res = await fetch(`${INGEST_API}/v1/content-factory/jobs/${jobId}/cancel`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateReview(
  jobId: string,
  payload: {
    title?: string;
    subject_id?: string;
    paper_number?: number;
    publisher?: string;
    edition?: string;
    chapters?: ChapterCandidate[];
    selected_cover_page?: number;
    rights_status?: RightsStatus;
    distribution_allowed?: boolean;
  }
): Promise<ImportJob> {
  const res = await fetch(`${INGEST_API}/v1/content-factory/jobs/${jobId}/review`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function discoverFolder(
  folderPath: string,
  recursive: boolean = true
): Promise<DiscoverySummary> {
  const res = await fetch(`${INGEST_API}/v1/content-factory/discover/folder`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ folder_path: folderPath, recursive }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function discoverDrive(inboxFolderId?: string): Promise<DiscoverySummary> {
  const res = await fetch(`${INGEST_API}/v1/content-factory/discover/drive`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ inbox_folder_id: inboxFolderId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function batchImport(payload: {
  group_name: string;
  source_type: string;
  candidates: DiscoveryCandidate[];
  defaults?: Record<string, any>;
  priority?: JobPriority;
  profile?: ProcessingProfile;
}): Promise<{ group_id: string; group_name: string; total_enqueued: number; jobs: string[] }> {
  const res = await fetch(`${INGEST_API}/v1/content-factory/import/batch`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function batchMutate(payload: {
  job_ids?: string[];
  book_ids?: string[];
  subject_id?: string;
  paper_number?: number;
  rights_status?: RightsStatus;
  distribution_allowed?: boolean;
  priority?: JobPriority;
}): Promise<{ updated_count: number; job_ids: string[] }> {
  const res = await fetch(`${INGEST_API}/v1/content-factory/batch/mutate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchImportGroups(): Promise<ImportGroup[]> {
  const res = await fetch(`${INGEST_API}/v1/content-factory/groups`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Worker returned ${res.status}`);
  return res.json();
}

export async function validatePublish(
  ids: { job_ids?: string[]; book_ids?: string[] } | string[]
): Promise<{
  total_selected: number;
  ready_count: number;
  blocked_count: number;
  results: Array<{
    id?: string;
    job_id?: string;
    book_title?: string;
    ready: boolean;
    blocking_issues: string[];
    warnings: string[];
  }>;
}> {
  const payload = Array.isArray(ids) ? { job_ids: ids } : ids;
  const res = await fetch(`${INGEST_API}/v1/content-factory/publish/validate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function publishBulk(payload: {
  job_ids?: string[];
  book_ids?: string[];
  rights_confirmed: boolean;
  rights_status: RightsStatus;
  distribution_allowed: boolean;
}): Promise<{
  published_count: number;
  failed_count: number;
  published_ids?: string[];
  published_job_ids?: string[];
  failed: Array<{ id?: string; job_id?: string; error: string }>;
}> {
  const res = await fetch(`${INGEST_API}/v1/content-factory/publish/bulk`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function publishJob(
  jobId: string,
  payload: {
    rights_confirmed: boolean;
    rights_status: RightsStatus;
    distribution_allowed: boolean;
  }
): Promise<ImportJob> {
  const res = await fetch(`${INGEST_API}/v1/content-factory/jobs/${jobId}/publish`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createResumableSession(
  filename: string,
  fileSize: number,
  subjectHint?: string,
  paperHint?: number,
  importGroupId?: string,
  priority: JobPriority = 'NORMAL',
  profile: ProcessingProfile = 'STANDARD'
): Promise<{ session_id: string; chunk_size: number; upload_url: string }> {
  const res = await fetch(`${INGEST_API}/v1/uploads/pdf/session`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      filename,
      file_size: fileSize,
      subject_hint: subjectHint,
      paper_hint: paperHint,
      import_group_id: importGroupId,
      priority,
      profile,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadResumableChunk(
  sessionId: string,
  chunk: Blob
): Promise<{ bytes_received: number; total_bytes: number; is_complete: boolean }> {
  const res = await fetch(`${INGEST_API}/v1/uploads/pdf/${sessionId}/chunk`, {
    method: 'PUT',
    headers: { 'content-type': 'application/octet-stream' },
    body: chunk,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function completeResumableSession(sessionId: string): Promise<ImportJob> {
  const res = await fetch(`${INGEST_API}/v1/uploads/pdf/${sessionId}/complete`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
