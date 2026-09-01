"use client";

import { useState } from 'react';
import { AlertCircle, CheckCircle, Send, Sparkles } from 'lucide-react';
import { ImportJob, publishJob, RightsStatus } from '@/lib/api';

export function PublishPanel({
  job,
  rightsStatus,
  distributionAllowed,
  onPublished,
}: {
  job: ImportJob;
  rightsStatus: RightsStatus;
  distributionAllowed: boolean;
  onPublished: (updatedJob: ImportJob) => void;
}) {
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');

  const canPublish =
    rightsStatus !== 'UNVERIFIED' &&
    distributionAllowed &&
    rightsConfirmed &&
    !isPublishing;

  const handlePublish = async () => {
    if (!canPublish) return;
    setError('');
    setIsPublishing(true);
    try {
      const updated = await publishJob(job.id, {
        rights_confirmed: rightsConfirmed,
        rights_status: rightsStatus,
        distribution_allowed: distributionAllowed,
      });
      onPublished(updated);
    } catch (err: any) {
      setError(err?.message || 'Publishing failed');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6">
      <h4 className="text-base font-bold text-white mb-2">Publish to Student Catalog</h4>
      <p className="text-xs text-white/50 mb-4">
        Publishing activates this book version atomically. Students will instantly see the book in Subject Explorer, Library, and Home.
      </p>

      {/* Validation Checklist */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle className="w-4 h-4 text-mint" />
          <span className="text-white/80">Encrypted HSCP Package Ready</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle className="w-4 h-4 text-mint" />
          <span className="text-white/80">Cover & Thumbnail Generated</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {rightsStatus !== 'UNVERIFIED' ? (
            <CheckCircle className="w-4 h-4 text-mint" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span className={rightsStatus !== 'UNVERIFIED' ? 'text-white/80' : 'text-rose-400'}>
            Rights Status: {rightsStatus}
          </span>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <label className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={rightsConfirmed}
          onChange={(e) => setRightsConfirmed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#121824] text-mint focus:ring-mint accent-[#57E0B7]"
        />
        <span className="text-xs text-white/80 leading-relaxed">
          I confirm that I have reviewed the generated chapters, cover, and rights metadata, and authorize distribution to student devices.
        </span>
      </label>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={!canPublish}
        onClick={handlePublish}
        className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
          canPublish
            ? 'bg-mint text-ink hover:opacity-90 active:scale-95 shadow-lg shadow-mint/10'
            : 'bg-white/5 text-white/30 cursor-not-allowed'
        }`}
      >
        <Send className="w-4 h-4" />
        {isPublishing ? 'Publishing Atomically…' : 'Publish Book to Mobile Catalog'}
      </button>
    </div>
  );
}
