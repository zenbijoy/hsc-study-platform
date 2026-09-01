"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import {
  completeResumableSession,
  createResumableSession,
  fetchJob,
  ImportJob,
  RightsStatus,
  updateReview,
  uploadResumableChunk,
} from '@/lib/api';
import { PdfDropZone } from '@/components/upload/PdfDropZone';
import { ProcessingPipeline } from '@/components/upload/ProcessingPipeline';
import { MetadataEditor } from '@/components/upload/MetadataEditor';
import { RightsEditor } from '@/components/upload/RightsEditor';
import { ChapterReview } from '@/components/upload/ChapterReview';
import { PublishPanel } from '@/components/upload/PublishPanel';

export default function BookImportPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [job, setJob] = useState<ImportJob | null>(null);
  const [error, setError] = useState('');
  const [rightsStatus, setRightsStatus] = useState<RightsStatus>('UNVERIFIED');
  const [distributionAllowed, setDistributionAllowed] = useState(false);

  // Poll active job while processing
  useEffect(() => {
    if (!job || ['published', 'ready_for_review', 'failed'].includes(job.status)) return;
    const interval = setInterval(async () => {
      try {
        const updated = await fetchJob(job.id);
        setJob(updated);
      } catch {}
    }, 1000);
    return () => clearInterval(interval);
  }, [job]);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setError('');
    setUploadProgress(0);
    setJob(null);

    try {
      // 1. Create Resumable Session
      const session = await createResumableSession(file.name, file.size);
      const chunkSize = session.chunk_size;
      let offset = 0;

      // 2. Stream Chunks (Constant memory footprint)
      while (offset < file.size) {
        const chunk = file.slice(offset, offset + chunkSize);
        await uploadResumableChunk(session.session_id, chunk);
        offset += chunk.size;
        setUploadProgress(Math.round((offset / file.size) * 100));
      }

      // 3. Complete Upload & Queue Processing
      const createdJob = await completeResumableSession(session.session_id);
      setJob(createdJob);
    } catch (err: any) {
      setError(err?.message || 'Resumable upload failed');
    }
  };

  const handleMetadataChange = (meta: any) => {
    if (job?.id && job.status === 'ready_for_review') {
      updateReview(job.id, meta).catch(() => {});
    }
  };

  const handleChaptersChange = (chapters: any[]) => {
    if (job?.id && job.status === 'ready_for_review') {
      updateReview(job.id, { chapters }).catch(() => {});
    }
  };

  return (
    <main className="min-h-screen bg-[#070A0F] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs uppercase tracking-wider text-mint font-bold">
                Admin Content Studio
              </span>
              <h1 className="text-2xl font-black text-white">
                PDF Book Ingestion & Publishing
              </h1>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Upload Zone */}
        {!job && (
          <div>
            <PdfDropZone
              onFilesSelected={handleFilesSelected}
              disabled={uploadProgress > 0 && uploadProgress < 100}
            />
            {uploadProgress > 0 && (
              <div className="mt-6 bg-[#0B0F17] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span>Uploading {selectedFile?.name}</span>
                  <span className="text-mint">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-mint transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Processing & Review */}
        {job && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Pipeline Timeline */}
            <div className="space-y-6">
              <ProcessingPipeline job={job} />

              {job.status === 'published' && (
                <div className="bg-mint/10 border border-mint/20 rounded-2xl p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-mint mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">
                    Book Published Successfully! 🚀
                  </h3>
                  <p className="text-xs text-white/70 mb-4">
                    The book is now active in the student mobile catalog.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setJob(null);
                      setSelectedFile(null);
                      setUploadProgress(0);
                    }}
                    className="w-full py-2.5 rounded-xl bg-mint text-ink font-bold text-xs"
                  >
                    Upload Another PDF
                  </button>
                </div>
              )}
            </div>

            {/* Middle & Right Col: Review & Publish Panels */}
            <div className="lg:col-span-2 space-y-6">
              {job.status === 'ready_for_review' && job.result?.book && (
                <>
                  <MetadataEditor
                    initialTitle={job.result.book.title}
                    initialSubject={job.result.book.subject_id || 'physics'}
                    initialPaper={job.result.book.paper || 1}
                    initialPublisher={job.result.book.publisher || 'NCTB Approved'}
                    pageCount={job.result.book.page_count}
                    onChange={handleMetadataChange}
                  />

                  <RightsEditor
                    initialStatus={rightsStatus}
                    initialDistributionAllowed={distributionAllowed}
                    onChange={({ status, distributionAllowed: da }) => {
                      setRightsStatus(status);
                      setDistributionAllowed(da);
                    }}
                  />

                  <ChapterReview
                    initialChapters={job.result.book.chapters}
                    pageCount={job.result.book.page_count}
                    onChange={handleChaptersChange}
                  />

                  <PublishPanel
                    job={job}
                    rightsStatus={rightsStatus}
                    distributionAllowed={distributionAllowed}
                    onPublished={(publishedJob) => setJob(publishedJob)}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
