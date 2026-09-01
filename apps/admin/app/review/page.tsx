"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  FileCheck,
  Filter,
  Image as ImageIcon,
  Layers,
  ListOrdered,
  RefreshCw,
  Save,
  Send,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  ChapterCandidate,
  CoverCandidate,
  fetchJob,
  fetchJobs,
  ImportJob,
  publishBulk,
  publishJob,
  RightsStatus,
  updateReview,
  validatePublish,
} from '@/lib/api';

function ReviewQueueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get('jobId');

  // State
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'metadata' | 'chapters' | 'ready'>('all');

  // Active book editing state
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('physics');
  const [editPaper, setEditPaper] = useState(1);
  const [editPublisher, setEditPublisher] = useState('');
  const [editEdition, setEditEdition] = useState('');
  const [editRights, setEditRights] = useState<RightsStatus>('LICENSED');
  const [editDistAllowed, setEditDistAllowed] = useState(true);
  const [editChapters, setEditChapters] = useState<ChapterCandidate[]>([]);
  const [selectedCoverPage, setSelectedCoverPage] = useState(1);

  // Bulk publish state
  const [validationResult, setValidationResult] = useState<{
    total_selected: number;
    ready_count: number;
    blocked_count: number;
    results: any[];
  } | null>(null);
  const [publishing, setPublishing] = useState(false);

  // Fetch all ready_for_review jobs
  const loadReviewQueue = async () => {
    try {
      setLoading(true);
      const allJobs = await fetchJobs({ limit: 300, status: 'ready_for_review' });
      setJobs(allJobs);

      if (initialJobId) {
        const foundIdx = allJobs.findIndex((j) => j.id === initialJobId);
        if (foundIdx !== -1) setCurrentIndex(foundIdx);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewQueue();
  }, []);

  const currentJob = jobs[currentIndex] || null;
  const currentBook = currentJob?.result?.book;

  // Sync edit state whenever currentJob changes
  useEffect(() => {
    if (!currentJob) return;
    const b = currentJob.result?.book;
    setEditTitle(currentJob.detected_title || b?.title || currentJob.source_name);
    setEditSubject(currentJob.subject_id || b?.subject_id || 'physics');
    setEditPaper(currentJob.paper_number || b?.paper || 1);
    setEditPublisher(currentJob.detected_publisher || b?.publisher || 'NCTB Approved');
    setEditEdition(currentJob.detected_edition || b?.edition || '');
    setEditRights(currentJob.rights_status || b?.rights_status || 'UNVERIFIED');
    setEditDistAllowed(currentJob.distribution_allowed ?? b?.distribution_allowed ?? false);
    setEditChapters(b?.chapters || []);
    setSelectedCoverPage(currentJob.selected_cover_page || 1);
  }, [currentJob]);

  // Keyboard navigation (J/K next/prev, A approve, S save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'j' || e.key === 'ArrowRight') {
        if (currentIndex < jobs.length - 1) setCurrentIndex((i) => i + 1);
      } else if (e.key === 'k' || e.key === 'ArrowLeft') {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
      } else if (e.key === 'a' || e.key === 'A') {
        handleApproveAndNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, jobs, editTitle, editSubject, editPaper, editRights, editDistAllowed]);

  // Save changes
  const handleSaveDraft = async () => {
    if (!currentJob) return;
    try {
      setSaving(true);
      const updated = await updateReview(currentJob.id, {
        title: editTitle,
        subject_id: editSubject,
        paper_number: editPaper,
        publisher: editPublisher,
        edition: editEdition,
        rights_status: editRights,
        distribution_allowed: editDistAllowed,
        chapters: editChapters,
        selected_cover_page: selectedCoverPage,
      });

      // Update in local array
      const updatedJobs = [...jobs];
      updatedJobs[currentIndex] = updated;
      setJobs(updatedJobs);
    } catch (err: any) {
      alert(`Save failed: ${err?.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Approve & Auto-advance
  const handleApproveAndNext = async () => {
    if (!currentJob) return;
    await handleSaveDraft();
    if (currentIndex < jobs.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  // Dry-run publish validation
  const handleRunValidation = async () => {
    const ids = jobs.map((j) => j.id);
    if (!ids.length) return;
    try {
      setLoading(true);
      const val = await validatePublish(ids);
      setValidationResult(val);
    } catch (err: any) {
      alert(`Validation failed: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Bulk publish ready jobs
  const handleBulkPublish = async () => {
    const readyJobIds = validationResult?.results.filter((r) => r.ready).map((r) => r.job_id) || [];
    if (!readyJobIds.length) return;

    try {
      setPublishing(true);
      const res = await publishBulk({
        job_ids: readyJobIds,
        rights_confirmed: true,
        rights_status: 'LICENSED',
        distribution_allowed: true,
      });
      alert(`Bulk Published: ${res.published_count} books published successfully!`);
      await loadReviewQueue();
      setValidationResult(null);
    } catch (err: any) {
      alert(`Bulk publish failed: ${err?.message}`);
    } finally {
      setPublishing(false);
    }
  };

  // Single job publish
  const handlePublishSingle = async () => {
    if (!currentJob) return;
    try {
      setPublishing(true);
      await publishJob(currentJob.id, {
        rights_confirmed: true,
        rights_status: editRights,
        distribution_allowed: editDistAllowed,
      });
      alert(`Book '${editTitle}' published to mobile catalog! 🚀`);
      await loadReviewQueue();
    } catch (err: any) {
      alert(`Publish failed: ${err?.message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070A0F] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/imports/bulk')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                Admin Review Studio
              </span>
              <h1 className="text-2xl font-black text-white">
                Book Review & Publication Queue
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRunValidation}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-bold text-xs border border-cyan-500/30 flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Validate All ({jobs.length}) for Publishing
            </button>
          </div>
        </div>

        {/* Validation Dry-run Result Alert */}
        {validationResult && (
          <div className="bg-[#0B0F17] border border-cyan-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-mint" />
                <div>
                  <h3 className="text-base font-bold text-white">Publication Readiness Breakdown</h3>
                  <p className="text-xs text-white/60">
                    Selected: {validationResult.total_selected} •{' '}
                    <span className="text-mint font-bold">Ready: {validationResult.ready_count}</span> •{' '}
                    <span className="text-rose-400 font-bold">Blocked: {validationResult.blocked_count}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setValidationResult(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white/70 text-xs font-semibold"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  disabled={publishing || validationResult.ready_count === 0}
                  onClick={handleBulkPublish}
                  className="px-5 py-2 rounded-xl bg-mint text-ink font-bold text-xs hover:bg-mint/90 transition-colors disabled:opacity-40"
                >
                  {publishing ? 'Publishing...' : `Publish ${validationResult.ready_count} Ready Books`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Queue Navigation Bar */}
        <div className="flex items-center justify-between bg-[#0B0F17] border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white/70">
              Item {jobs.length > 0 ? currentIndex + 1 : 0} of {jobs.length}
            </span>
            <div className="text-xs text-white/40 hidden sm:inline">
              (Use <kbd className="px-1.5 py-0.5 bg-white/10 rounded">J</kbd>/
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">K</kbd> to navigate,{' '}
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">A</kbd> to approve)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={currentIndex >= jobs.length - 1}
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SIDE-BY-SIDE REVIEW WORKSPACE */}
        {currentJob ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Pane (5 Cols): Cover Candidates & Duplicate Alert */}
            <div className="lg:col-span-5 space-y-6">
              {/* Duplicate/Version Banner */}
              {currentJob.duplicate_info && currentJob.duplicate_info.duplicate_type !== 'NONE' && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                    <Copy className="w-4 h-4" />
                    {currentJob.duplicate_info.duplicate_type === 'EXACT_FILE_DUPLICATE'
                      ? 'Exact File Duplicate'
                      : 'Possible New Version of Existing Book'}
                  </div>
                  <p className="text-xs text-white/70">{currentJob.duplicate_info.reason}</p>
                </div>
              )}

              {/* Cover Candidates Selector */}
              <div className="bg-[#0B0F17] border border-white/10 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase font-bold text-white/60 tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-mint" />
                    Cover Page Candidate
                  </h3>
                  <span className="text-xs text-mint font-semibold">Page {selectedCoverPage} Selected</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setSelectedCoverPage(page)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedCoverPage === page
                          ? 'border-mint bg-mint/10 text-mint font-bold'
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs mb-1">Page {page}</div>
                      <div className="text-[10px] text-white/40">Candidate</div>
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-white/40">
                  Page 1 selected by default. You can switch candidate if Page 2 or 3 contains the actual textbook cover art.
                </div>
              </div>

              {/* File Info */}
              <div className="bg-[#0B0F17] border border-white/10 p-6 rounded-2xl space-y-3 text-xs">
                <h3 className="font-bold text-white/70 uppercase text-[11px]">Source Details</h3>
                <div className="space-y-1.5 text-white/60">
                  <div className="flex justify-between">
                    <span>Filename:</span>
                    <span className="font-mono text-white text-[11px] truncate max-w-[200px]">
                      {currentJob.source_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Source Hash:</span>
                    <span className="font-mono text-white text-[11px]">
                      {currentJob.source_hash ? currentJob.source_hash.slice(0, 12) + '...' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scanned PDF:</span>
                    <span className="text-white">
                      {currentBook?.is_scanned ? 'Yes (OCR Enabled)' : 'No (Digital Text)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Pages:</span>
                    <span className="text-white">{currentBook?.page_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Pane (7 Cols): Metadata & Chapters Editor */}
            <div className="lg:col-span-7 space-y-6">
              {/* Metadata Form */}
              <div className="bg-[#0B0F17] border border-white/10 p-6 rounded-2xl space-y-4">
                <h3 className="text-xs uppercase font-bold text-white/60 tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-mint" />
                  Textbook Metadata
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Book Title:</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-white/70 block mb-1">Subject:</label>
                      <select
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                      >
                        <option value="physics">Physics (পদার্থবিজ্ঞান)</option>
                        <option value="chemistry">Chemistry (রসায়ন)</option>
                        <option value="mathematics">Higher Math (উচ্চতর গণিত)</option>
                        <option value="biology">Biology (জীববিজ্ঞান)</option>
                        <option value="ict">ICT (তথ্য ও যোগাযোগ প্রযুক্তি)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/70 block mb-1">Paper:</label>
                      <select
                        value={editPaper}
                        onChange={(e) => setEditPaper(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                      >
                        <option value="1">1st Paper (১ম পত্র)</option>
                        <option value="2">2nd Paper (২য় পত্র)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-white/70 block mb-1">Publisher:</label>
                      <input
                        type="text"
                        value={editPublisher}
                        onChange={(e) => setEditPublisher(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/70 block mb-1">Edition:</label>
                      <input
                        type="text"
                        placeholder="e.g. 2026 Edition"
                        value={editEdition}
                        onChange={(e) => setEditEdition(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rights Verification */}
              <div className="bg-[#0B0F17] border border-amber-500/20 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="text-xs uppercase font-bold tracking-wider">Rights & Distribution Guard</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Rights Status:</label>
                    <select
                      value={editRights}
                      onChange={(e) => setEditRights(e.target.value as RightsStatus)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                    >
                      <option value="LICENSED">LICENSED</option>
                      <option value="OWNED">OWNED</option>
                      <option value="OPEN_LICENSE">OPEN_LICENSE</option>
                      <option value="PUBLIC_DOMAIN">PUBLIC_DOMAIN</option>
                      <option value="INTERNAL_ONLY">INTERNAL_ONLY</option>
                      <option value="UNVERIFIED">UNVERIFIED</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editDistAllowed}
                        onChange={(e) => setEditDistAllowed(e.target.checked)}
                        className="rounded border-white/20"
                      />
                      <span>Allow Student Distribution</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Chapter Boundary Outline */}
              <div className="bg-[#0B0F17] border border-white/10 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase font-bold text-white/60 tracking-wider flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-mint" />
                    Chapter Outline ({editChapters.length} Chapters)
                  </h3>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {editChapters.length === 0 ? (
                    <div className="text-xs text-white/40 italic p-3 text-center">
                      No chapter boundaries detected.
                    </div>
                  ) : (
                    editChapters.map((ch, i) => (
                      <div
                        key={i}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="font-semibold text-white truncate max-w-sm">
                          {ch.number}. {ch.title}
                        </div>
                        <div className="text-white/50 text-[11px]">
                          Pages {ch.start_page}–{ch.end_page || 'end'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleApproveAndNext}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold text-xs border border-emerald-500/30 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve & Next (A)
                  </button>

                  <button
                    type="button"
                    onClick={handlePublishSingle}
                    disabled={publishing || editRights === 'UNVERIFIED' || !editDistAllowed}
                    className="px-6 py-2.5 rounded-xl bg-mint text-ink font-bold text-xs hover:bg-mint/90 transition-colors disabled:opacity-40 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {publishing ? 'Publishing...' : 'Publish Book Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-12 text-center text-white/50">
            No items in review queue. Use the Mass Ingestion studio to discover or upload textbooks.
          </div>
        )}
      </div>
    </main>
  );
}

export default function ReviewQueuePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070A0F] text-white flex items-center justify-center">
          <div className="text-white/50 text-xs">Loading Review Queue...</div>
        </div>
      }
    >
      <ReviewQueueContent />
    </Suspense>
  );
}
