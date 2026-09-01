export const INGEST_API = process.env.NEXT_PUBLIC_INGEST_API_URL ?? 'http://localhost:8787';

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
  message?: string;
  created_at: string;
};

export async function fetchJob(id: string): Promise<ImportJob> {
  const res = await fetch(`${INGEST_API}/v1/imports/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Worker returned ${res.status}`);
  return res.json();
}
