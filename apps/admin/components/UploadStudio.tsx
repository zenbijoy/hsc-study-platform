"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Code2,
  FileText,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { fetchJob, INGEST_API, type ImportJob } from '@/lib/api';

function formatBytes(value: number) {
  if (!value) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

const sampleJsonl = `{"type":"formula","subject":"physics","paper":1,"chapter":"Newtonian Mechanics","title":"Second Law of Motion","latex":"F=ma","plain":"F = ma","importance":5}
{"type":"cq","subject":"physics","paper":1,"chapter":"Newtonian Mechanics","title":"Banking of Roads","stimulus":"A car of mass 1200kg negotiates a 150m curved road...","board":"Dhaka Board","year":2024,"difficulty":"hard"}
{"type":"mcq","subject":"physics","paper":1,"chapter":"Vectors","question":"If two forces P act at angle 120 deg, what is the resultant?","options":["P/2","P","2P","P*sqrt(3)"],"correct_index":1,"explanation":"R = sqrt(P^2+P^2+2P^2 cos 120) = P"}`;

export function UploadStudio() {
  const [activeTab, setActiveTab] = useState<'upload' | 'ai'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [jsonlContent, setJsonlContent] = useState(sampleJsonl);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [job, setJob] = useState<ImportJob | null>(null);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!job || ['published', 'ready_for_review', 'failed'].includes(job.status)) return;
    const t = setInterval(async () => {
      try {
        setJob(await fetchJob(job.id));
      } catch {}
    }, 900);
    return () => clearInterval(t);
  }, [job]);

  const choose = useCallback((candidate?: File) => {
    if (!candidate) return;
    setFile(candidate);
    setJob(null);
    setError('');
    setUploadProgress(0);
  }, []);

  const uploadFile = useCallback(() => {
    if (!file) return;
    setError('');
    const form = new FormData();
    form.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${INGEST_API}/v1/imports/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () =>
      setError('Cannot reach the Content Factory worker. Start it on port 8787.');
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300)
        return setError(xhr.responseText || `Upload failed (${xhr.status})`);
      setUploadProgress(100);
      try {
        setJob(JSON.parse(xhr.responseText));
      } catch {
        setError('Worker returned invalid JSON');
      }
    };
    xhr.send(form);
  }, [file]);

  const importTextPayload = async () => {
    if (!jsonlContent.trim()) return;
    setError('');
    try {
      const res = await fetch(`${INGEST_API}/v1/imports/text`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'ai-generated-batch.jsonl',
          format: 'jsonl',
          content: jsonlContent,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setJob(await res.json());
      setUploadProgress(100);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to stage AI text import. Check worker on port 8787.');
    }
  };

  const reset = () => {
    setFile(null);
    setJob(null);
    setUploadProgress(0);
    setError('');
    setRightsConfirmed(false);
    if (input.current) input.current.value = '';
  };

  const publish = async () => {
    if (!job || !rightsConfirmed) return;
    setPublishing(true);
    setError('');
    try {
      const res = await fetch(`${INGEST_API}/v1/imports/${job.id}/publish`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rights_confirmed: true }),
      });
      if (!res.ok) throw new Error(await res.text());
      setJob(await res.json());
    } catch (e: any) {
      setError(e?.message ?? 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  const processProgress = job?.progress ?? 0;
  const stageRows = [
    ['Secure upload / staging', uploadProgress === 100],
    ['Source fingerprint & dedupe', Boolean(job)],
    [
      'Structure & chapter ranges',
      Boolean(
        job &&
          ['structure', 'extract', 'pack', 'review', 'ready_for_review', 'published'].includes(
            job.stage
          )
      ),
    ],
    [
      'Formula & CQ enrichment',
      Boolean(
        job &&
          ['extract', 'pack', 'review', 'ready_for_review', 'published'].includes(job.stage)
      ),
    ],
    [
      'Content packs & HSCP packaging',
      Boolean(job && ['pack', 'review', 'ready_for_review', 'published'].includes(job.stage)),
    ],
  ] as const;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      {/* Left: Ingestion Studio */}
      <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[#0B151E]/90 p-7 shadow-2xl shadow-black/20">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#57E0B7]">
              <Sparkles className="h-4 w-4" /> Universal Content Importer
            </div>
            <h2 className="mt-2.5 text-2xl font-black tracking-tight md:text-3xl">
              Stage Source & Build Graph
            </h2>
            <p className="mt-2 text-xs leading-5 text-white/45">
              Heavy PDF and data files are streamed to Google Drive / local warehouse origin, while Supabase stores lightweight relational metadata.
            </p>
          </div>
          <div className="hidden rounded-2xl border border-[#57E0B7]/20 bg-[#57E0B7]/10 p-3 text-[#57E0B7] md:block">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Tab Selector */}
        <div className="mt-6 flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === 'upload' ? 'bg-[#57E0B7] text-[#071018]' : 'text-white/60 hover:text-white'
            }`}
          >
            <UploadCloud className="h-4 w-4" /> File Dropzone
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === 'ai' ? 'bg-[#57E0B7] text-[#071018]' : 'text-white/60 hover:text-white'
            }`}
          >
            <Code2 className="h-4 w-4" /> AI JSONL Generator
          </button>
        </div>

        {activeTab === 'upload' ? (
          /* File Dropzone */
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                choose(e.dataTransfer.files?.[0]);
              }}
              onClick={() => input.current?.click()}
              className={`mt-6 cursor-pointer rounded-[28px] border border-dashed p-9 text-center transition ${
                drag
                  ? 'border-[#57E0B7] bg-[#57E0B7]/10'
                  : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
              }`}
            >
              <input
                ref={input}
                type="file"
                className="hidden"
                accept=".pdf,.txt,.md,.jsonl,.json,.csv"
                onChange={(e) => choose(e.target.files?.[0])}
              />
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#57E0B7]/25 to-[#6CB7FF]/15">
                <UploadCloud className="h-6 w-6 text-[#57E0B7]" />
              </div>
              <div className="mt-4 text-base font-bold">
                {file ? file.name : 'Drop 300MB+ PDF, TXT, JSONL or CSV'}
              </div>
              <div className="mt-1 text-xs text-white/40">
                {file ? formatBytes(file.size) : 'Supports large HSC textbook PDFs & structured AI questions'}
              </div>
            </div>

            {file && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-[#6CB7FF]" />
                    <div className="truncate text-xs font-semibold">{file.name}</div>
                  </div>
                  <div className="text-xs text-white/40">{formatBytes(file.size)}</div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#57E0B7] to-[#6CB7FF] transition-all duration-300"
                    style={{ width: `${Math.max(uploadProgress, processProgress)}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-white/35">
                  <span>{job ? `${job.stage} · ${job.status}` : uploadProgress ? 'Uploading…' : 'Ready'}</span>
                  <span>{job ? Math.round(processProgress) : uploadProgress}%</span>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                disabled={!file || (!!job && job.status !== 'failed')}
                onClick={uploadFile}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#57E0B7] px-5 py-3 text-xs font-black text-[#071018] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play className="h-4 w-4" /> Start Pipeline
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white/70 hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </>
        ) : (
          /* AI JSONL Importer */
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white/60">
                JSONL Content Schema Input:
              </span>
              <button
                onClick={() => setJsonlContent(sampleJsonl)}
                className="text-[11px] font-bold text-mint hover:underline"
              >
                Load Sample Batch
              </button>
            </div>
            <textarea
              rows={7}
              value={jsonlContent}
              onChange={(e) => setJsonlContent(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-xs text-white/85 focus:border-[#57E0B7] focus:outline-none"
              placeholder='{"type":"formula","subject":"physics","chapter":"Motion",...}'
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={importTextPayload}
                disabled={!jsonlContent.trim()}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#57E0B7] px-5 py-3 text-xs font-black text-[#071018] transition hover:brightness-105 disabled:opacity-40"
              >
                <Send className="h-4 w-4" /> Ingest JSONL Batch
              </button>
              <button
                onClick={() => setJsonlContent('')}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white/70 hover:bg-white/10"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* Right: Live Pipeline & Publication Review */}
      <section className="rounded-[34px] border border-white/10 bg-[#0B151E]/90 p-7 shadow-2xl shadow-black/20 justify-between flex flex-col">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.18em] text-[#6CB7FF]">
                Realtime Worker Status
              </div>
              <h3 className="mt-1.5 text-2xl font-black">Pipeline Monitor</h3>
            </div>
            <div className="rounded-2xl bg-white/5 px-3 py-1.5 text-xs font-bold text-white/50">
              {job?.id ? `JOB #${job.id.slice(0, 8)}` : 'IDLE'}
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            {stageRows.map(([label, done], i) => (
              <div
                key={label}
                className="flex items-center gap-3.5 rounded-2xl border border-white/8 bg-white/[0.02] p-3.5"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    done ? 'bg-[#57E0B7]/15 text-[#57E0B7]' : 'bg-white/5 text-white/25'
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : <span className="text-xs font-black">{i + 1}</span>}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-white/85">{label}</div>
                  <div className="text-[11px] text-white/30">
                    {done ? 'Verified' : job ? 'Processing…' : 'Awaiting input'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {job && (
            <div className="mt-5 grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl bg-white/[0.03] p-3 text-center">
                <div className="text-xl font-black text-white">{job.detected_chapters ?? 0}</div>
                <div className="text-[10px] font-semibold text-white/35 uppercase">Chapters</div>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-3 text-center">
                <div className="text-xl font-black text-white">{job.detected_formulas ?? 0}</div>
                <div className="text-[10px] font-semibold text-white/35 uppercase">Formulas</div>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-3 text-center">
                <div className="text-xl font-black text-white">{job.detected_cqs ?? 0}</div>
                <div className="text-[10px] font-semibold text-white/35 uppercase">CQs</div>
              </div>
            </div>
          )}
        </div>

        {/* Publication Confirmation */}
        {job?.status === 'ready_for_review' && (
          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
            <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-white/75">
              <input
                type="checkbox"
                checked={rightsConfirmed}
                onChange={(e) => setRightsConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#57E0B7]"
              />
              <span>
                I confirm this content is licensed, authorized, or approved for distribution.
              </span>
            </label>
            <button
              onClick={publish}
              disabled={!rightsConfirmed || publishing}
              className="mt-3.5 w-full flex items-center justify-center gap-2 rounded-2xl bg-[#57E0B7] py-3 text-xs font-black text-[#071018] transition hover:brightness-105 disabled:opacity-40"
            >
              <ShieldCheck className="h-4 w-4" />
              {publishing ? 'Publishing atomically…' : 'Publish to Production Catalog'}
            </button>
          </div>
        )}

        {job?.status === 'published' && (
          <div className="mt-6 rounded-2xl border border-[#57E0B7]/25 bg-[#57E0B7]/10 p-4 text-center">
            <div className="text-xs font-black text-[#57E0B7]">
              ✓ Published Successfully to Supabase Catalog!
            </div>
            <div className="mt-1 text-[11px] text-white/50">
              Pointer updated; mobile clients sync delta instantly.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
