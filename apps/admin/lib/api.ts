export const INGEST_API = process.env.NEXT_PUBLIC_INGEST_API_URL ?? 'http://localhost:8787';

export type RightsStatus =
  | 'OWNED'
  | 'LICENSED'
  | 'OPEN_LICENSE'
  | 'PUBLIC_DOMAIN'
  | 'PUBLISHER_AUTHORIZED'
  | 'INTERNAL_ONLY'
  | 'UNVERIFIED';

export type ChapterCandidate = {
  number: number;
  title: string;
  start_page: number;
  end_page?: number;
  confidence: number;
  source: string;
};

export type ImportJob = {
  id: string;
  source_name: string;
  source_type: string;
  status: string;
  stage: string;
  progress: number;
  total_items: number;
  processed_items: number;
  failed_items: number;
  detected_chapters?: number;
  detected_formulas?: number;
  detected_cqs?: number;
  rights_status?: RightsStatus;
  distribution_allowed?: boolean;
  subject_id?: string;
  paper_number?: number;
  message?: string;
  result?: {
    book?: {
      id: string;
      book_version_id: string;
      title: string;
      subtitle?: string;
      publisher?: string;
      subject_id?: string;
      paper?: number;
      page_count?: number;
      chapter_count?: number;
      formula_count?: number;
      cover_url?: string;
      cover_thumbnail_url?: string;
      rights_status?: RightsStatus;
      distribution_allowed?: boolean;
      chapters?: ChapterCandidate[];
      is_scanned?: boolean;
    };
    packs?: any[];
    duplicate_items_removed?: number;
    ocr_recommended?: boolean;
  };
  created_at: string;
};

export async function fetchJob(id: string): Promise<ImportJob> {
  const res = await fetch(`${INGEST_API}/v1/imports/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Worker returned ${res.status}`);
  return res.json();
}

export async function createResumableSession(
  filename: string,
  fileSize: number,
  subjectHint?: string,
  paperHint?: number
): Promise<{ session_id: string; chunk_size: number; upload_url: string }> {
  const res = await fetch(`${INGEST_API}/v1/uploads/pdf/session`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      filename,
      file_size: fileSize,
      subject_hint: subjectHint,
      paper_hint: paperHint,
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

export async function updateReview(
  jobId: string,
  payload: {
    title?: string;
    subject_id?: string;
    paper_number?: number;
    chapters?: ChapterCandidate[];
    rights_status?: RightsStatus;
    distribution_allowed?: boolean;
  }
): Promise<ImportJob> {
  const res = await fetch(`${INGEST_API}/v1/imports/${jobId}/review`, {
    method: 'PATCH',
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
  const res = await fetch(`${INGEST_API}/v1/imports/${jobId}/publish`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
