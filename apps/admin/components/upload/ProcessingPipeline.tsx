"use client";

import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { ImportJob } from '@/lib/api';

const STAGES = [
  { id: 'upload', label: 'Upload & Hash' },
  { id: 'quick_scan', label: 'Fingerprint & Dedupe' },
  { id: 'structure', label: 'TOC & Metadata Detection' },
  { id: 'cover', label: 'Cover Generation' },
  { id: 'pack', label: 'HSCP AES-256-GCM Encryption' },
  { id: 'extract', label: 'Staging & Search Index' },
  { id: 'ready_for_review', label: 'Ready for Review' },
  { id: 'published', label: 'Published to Mobile' },
];

export function ProcessingPipeline({ job }: { job: ImportJob }) {
  const currentIdx = STAGES.findIndex(
    (s) => s.id === job.stage || (job.status === 'ready_for_review' && s.id === 'ready_for_review') || (job.status === 'published' && s.id === 'published')
  );

  return (
    <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-mint font-bold">
            Processing Timeline
          </span>
          <h4 className="text-base font-bold text-white mt-0.5">
            {job.source_name}
          </h4>
        </div>
        <span className="text-xs font-mono text-white/50">
          Job ID: {job.id.slice(0, 8)}…
        </span>
      </div>

      <div className="space-y-3">
        {STAGES.map((s, idx) => {
          const isDone = idx < currentIdx || job.status === 'published';
          const isCurrent = idx === currentIdx && job.status !== 'published' && job.status !== 'failed';
          const isPending = idx > currentIdx && job.status !== 'published';

          return (
            <div
              key={s.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-mint/40 bg-mint/5 text-white'
                  : isDone
                  ? 'border-white/5 bg-white/[0.02] text-white/80'
                  : 'border-transparent text-white/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-mint shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-mint animate-spin shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-white/20 shrink-0" />
                )}
                <span className="text-sm font-semibold">{s.label}</span>
              </div>

              {isCurrent && (
                <span className="text-xs font-bold text-mint">
                  {job.progress}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {job.message && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/60">
          <span>Status: {job.message}</span>
        </div>
      )}
    </div>
  );
}
