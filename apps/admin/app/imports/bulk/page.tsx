"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cloud,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  FolderOpen,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import {
  batchImport,
  batchMutate,
  completeResumableSession,
  createResumableSession,
  discoverDrive,
  discoverFolder,
  DiscoveryCandidate,
  DiscoverySummary,
  fetchImportGroups,
  fetchJobs,
  ImportGroup,
  ImportJob,
  JobPriority,
  ProcessingProfile,
  RightsStatus,
  uploadResumableChunk,
} from '@/lib/api';

export default function BulkImportPage() {
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState<'upload' | 'drive' | 'folder' | 'jobs'>('jobs');
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [groups, setGroups] = useState<ImportGroup[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Drive discovery state
  const [driveFolderId, setDriveFolderId] = useState('');
  const [driveSummary, setDriveSummary] = useState<DiscoverySummary | null>(null);

  // Folder discovery state
  const [localFolderPath, setLocalFolderPath] = useState('');
  const [folderSummary, setFolderSummary] = useState<DiscoverySummary | null>(null);

  // Bulk upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgressMap, setUploadProgressMap] = useState<Record<string, number>>({});

  // Batch action modals
  const [showRightsModal, setShowRightsModal] = useState(false);
  const [bulkRightsStatus, setBulkRightsStatus] = useState<RightsStatus>('LICENSED');
  const [bulkRightsConfirmed, setBulkRightsConfirmed] = useState(false);

  // Refresh jobs & groups
  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedJobs, fetchedGroups] = await Promise.all([
        fetchJobs({ limit: 500 }),
        fetchImportGroups().catch(() => []),
      ]);
      setJobs(fetchedJobs);
      setGroups(fetchedGroups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Filtered jobs
  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      !searchQuery ||
      j.source_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.detected_title && j.detected_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      j.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    const matchesSubject = subjectFilter === 'all' || j.subject_id === subjectFilter;

    return matchesSearch && matchesStatus && matchesSubject;
  });

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedJobIds.size === filteredJobs.length) {
      setSelectedJobIds(new Set());
    } else {
      setSelectedJobIds(new Set(filteredJobs.map((j) => j.id)));
    }
  };

  const toggleSelectJob = (id: string) => {
    const next = new Set(selectedJobIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedJobIds(next);
  };

  // Discovery Handlers
  const handleScanDrive = async () => {
    try {
      setLoading(true);
      const res = await discoverDrive(driveFolderId || undefined);
      setDriveSummary(res);
    } catch (err: any) {
      alert(`Drive scan failed: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleScanFolder = async () => {
    if (!localFolderPath.trim()) return;
    try {
      setLoading(true);
      const res = await discoverFolder(localFolderPath.trim(), true);
      setFolderSummary(res);
    } catch (err: any) {
      alert(`Folder scan failed: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEnqueueCandidates = async (
    candidates: DiscoveryCandidate[],
    groupName: string,
    sourceType: string
  ) => {
    try {
      setLoading(true);
      await batchImport({
        group_name: groupName,
        source_type: sourceType,
        candidates,
      });
      await loadData();
      setActiveTab('jobs');
      setDriveSummary(null);
      setFolderSummary(null);
    } catch (err: any) {
      alert(`Batch enqueue failed: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Multi-PDF upload stream
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    setUploadFiles(files);
    setUploading(true);

    for (const file of files) {
      try {
        const session = await createResumableSession(file.name, file.size);
        const chunkSize = session.chunk_size;
        let offset = 0;

        while (offset < file.size) {
          const chunk = file.slice(offset, offset + chunkSize);
          await uploadResumableChunk(session.session_id, chunk);
          offset += chunk.size;
          setUploadProgressMap((prev) => ({
            ...prev,
            [file.name]: Math.round((offset / file.size) * 100),
          }));
        }

        await completeResumableSession(session.session_id);
      } catch (err: any) {
        console.error(`Upload error for ${file.name}:`, err);
      }
    }

    setUploading(false);
    setUploadFiles([]);
    await loadData();
    setActiveTab('jobs');
  };

  // Batch Mutations
  const handleBatchSetSubject = async (subject_id: string) => {
    if (!selectedJobIds.size) return;
    await batchMutate({ job_ids: Array.from(selectedJobIds), subject_id });
    await loadData();
  };

  const handleBatchSetPaper = async (paper_number: number) => {
    if (!selectedJobIds.size) return;
    await batchMutate({ job_ids: Array.from(selectedJobIds), paper_number });
    await loadData();
  };

  const handleConfirmBulkRights = async () => {
    if (!bulkRightsConfirmed || !selectedJobIds.size) return;
    await batchMutate({
      job_ids: Array.from(selectedJobIds),
      rights_status: bulkRightsStatus,
      distribution_allowed: bulkRightsStatus !== 'UNVERIFIED',
    });
    setShowRightsModal(false);
    setBulkRightsConfirmed(false);
    await loadData();
  };

  // Summary counts
  const totalJobs = jobs.length;
  const processingCount = jobs.filter((j) => ['processing', 'upload'].includes(j.status)).length;
  const reviewCount = jobs.filter((j) => j.status === 'ready_for_review').length;
  const publishedCount = jobs.filter((j) => j.status === 'published').length;
  const failedCount = jobs.filter((j) => j.status === 'failed').length;

  return (
    <main className="min-h-screen bg-[#070A0F] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
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
                Phase 15 Production Engine
              </span>
              <h1 className="text-2xl font-black text-white">
                Content Factory — Mass PDF Ingestion
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/review')}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold text-xs flex items-center gap-2 border border-emerald-500/30"
            >
              <ShieldCheck className="w-4 h-4" />
              Open Review Queue ({reviewCount})
            </button>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-[#0B0F17] border border-white/10 p-5 rounded-2xl">
            <span className="text-xs text-white/60 font-semibold">Total Ingested</span>
            <div className="text-2xl font-black text-white mt-1">{totalJobs}</div>
          </div>
          <div className="bg-[#0B0F17] border border-cyan-500/20 p-5 rounded-2xl">
            <span className="text-xs text-cyan-400 font-semibold">Processing</span>
            <div className="text-2xl font-black text-cyan-400 mt-1">{processingCount}</div>
          </div>
          <div className="bg-[#0B0F17] border border-amber-500/20 p-5 rounded-2xl">
            <span className="text-xs text-amber-400 font-semibold">Needs Review</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{reviewCount}</div>
          </div>
          <div className="bg-[#0B0F17] border border-mint/20 p-5 rounded-2xl">
            <span className="text-xs text-mint font-semibold">Published</span>
            <div className="text-2xl font-black text-mint mt-1">{publishedCount}</div>
          </div>
          <div className="bg-[#0B0F17] border border-rose-500/20 p-5 rounded-2xl">
            <span className="text-xs text-rose-400 font-semibold">Failed</span>
            <div className="text-2xl font-black text-rose-400 mt-1">{failedCount}</div>
          </div>
        </div>

        {/* Source Mode Tabs */}
        <div className="flex border-b border-white/10 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'jobs'
                ? 'border-mint text-mint bg-mint/5'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Import Queue ({filteredJobs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-mint text-mint bg-mint/5'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload Multiple PDFs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'drive'
                ? 'border-mint text-mint bg-mint/5'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4" />
            Google Drive 00_INBOX
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('folder')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'folder'
                ? 'border-mint text-mint bg-mint/5'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Local Folder Discovery
          </button>
        </div>

        {/* TAB 1: UPLOAD MULTIPLE PDFS */}
        {activeTab === 'upload' && (
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-8 text-center space-y-6">
            <div className="max-w-md mx-auto space-y-4">
              <UploadCloud className="w-16 h-16 text-mint mx-auto" />
              <h3 className="text-lg font-bold text-white">Mass PDF Resumable Upload</h3>
              <p className="text-xs text-white/60">
                Select 10 to 100+ PDF textbooks. Files stream directly in 8 MB chunks with constant memory.
              </p>
              <label className="inline-block px-6 py-3 rounded-xl bg-mint text-ink font-bold text-xs cursor-pointer hover:bg-mint/90 transition-colors">
                Select PDF Files
                <input
                  type="file"
                  multiple
                  accept="application/pdf"
                  onChange={handleBulkUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploading && uploadFiles.length > 0 && (
              <div className="max-w-xl mx-auto space-y-3 text-left pt-6 border-t border-white/10">
                <span className="text-xs font-bold text-white/80">Streaming Progress:</span>
                {uploadFiles.map((file) => (
                  <div key={file.name} className="space-y-1">
                    <div className="flex justify-between text-xs text-white/70">
                      <span className="truncate">{file.name}</span>
                      <span className="text-mint font-semibold">
                        {uploadProgressMap[file.name] || 0}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-mint transition-all duration-200"
                        style={{ width: `${uploadProgressMap[file.name] || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GOOGLE DRIVE INBOX */}
        {activeTab === 'drive' && (
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Google Drive 00_INBOX Scanner</h3>
                <p className="text-xs text-white/60">
                  Scan configured 00_INBOX for new textbook PDFs placed by editorial staff.
                </p>
              </div>
              <button
                type="button"
                onClick={handleScanDrive}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-ink font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Scan Drive Inbox Now
              </button>
            </div>

            {driveSummary && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex gap-4 text-xs font-semibold">
                  <span className="text-emerald-400">New Files: {driveSummary.new_files}</span>
                  <span className="text-white/60">Unsupported: {driveSummary.unsupported}</span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2">
                  {driveSummary.candidates.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="font-bold text-white">{c.filename}</div>
                          <div className="text-[11px] text-white/50">
                            {(c.size / (1024 * 1024)).toFixed(1)} MB • Detected Subject:{' '}
                            {c.hints?.suggested_subject || 'auto'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-1 bg-white/10 rounded-md text-white/70">
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleEnqueueCandidates(
                      driveSummary.candidates,
                      `Drive Inbox Batch (${new Date().toLocaleDateString()})`,
                      'drive_inbox'
                    )
                  }
                  className="w-full py-3 rounded-xl bg-mint text-ink font-bold text-xs hover:bg-mint/90 transition-colors"
                >
                  Create Import Jobs for {driveSummary.candidates.length} Files
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LOCAL FOLDER DISCOVERY */}
        {activeTab === 'folder' && (
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Local Folder Ingestion</h3>
              <p className="text-xs text-white/60">
                Recursively discover PDFs from a folder on your host machine (e.g. D:\HSC Books). Folder hierarchy hints are extracted automatically.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="D:\Downloads\HSC Books"
                  value={localFolderPath}
                  onChange={(e) => setLocalFolderPath(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={handleScanFolder}
                  disabled={loading || !localFolderPath.trim()}
                  className="px-5 py-2.5 rounded-xl bg-mint text-ink font-bold text-xs hover:bg-mint/90 transition-colors"
                >
                  Scan Folder
                </button>
              </div>
            </div>

            {folderSummary && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex gap-4 text-xs font-semibold">
                  <span className="text-mint">Discovered Files: {folderSummary.new_files}</span>
                  <span className="text-white/60">Ignored / Non-PDF: {folderSummary.unsupported}</span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2">
                  {folderSummary.candidates.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-mint" />
                        <div>
                          <div className="font-bold text-white">{c.filename}</div>
                          <div className="text-[11px] text-white/50">
                            {(c.size / (1024 * 1024)).toFixed(1)} MB • Hint Subject:{' '}
                            {c.hints?.suggested_subject || 'auto'} • Hint Paper:{' '}
                            {c.hints?.suggested_paper || 'auto'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-1 bg-white/10 rounded-md text-white/70">
                        {c.hints?.rights_status || 'UNVERIFIED'}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleEnqueueCandidates(
                      folderSummary.candidates,
                      `Folder Import: ${localFolderPath.split(/[\\/]/).pop() || 'Batch'}`,
                      'local_folder'
                    )
                  }
                  className="w-full py-3 rounded-xl bg-mint text-ink font-bold text-xs hover:bg-mint/90 transition-colors"
                >
                  Enqueue All {folderSummary.candidates.length} Files for Content Factory Processing
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: IMPORT QUEUE TABLE & BATCH ACTIONS */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search by title, filename, or job ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0B0F17] border border-white/10 text-xs text-white placeholder:text-white/30"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0B0F17] border border-white/10 text-xs text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="queued">Queued</option>
                  <option value="processing">Processing</option>
                  <option value="ready_for_review">Needs Review</option>
                  <option value="published">Published</option>
                  <option value="failed">Failed</option>
                </select>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0B0F17] border border-white/10 text-xs text-white"
                >
                  <option value="all">All Subjects</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="mathematics">Higher Math</option>
                  <option value="biology">Biology</option>
                  <option value="ict">ICT</option>
                </select>
              </div>

              {/* Batch Action Buttons */}
              {selectedJobIds.size > 0 && (
                <div className="flex items-center gap-2 bg-[#0B0F17] border border-white/15 px-3 py-1.5 rounded-xl">
                  <span className="text-xs font-bold text-mint">{selectedJobIds.size} Selected</span>
                  <div className="h-4 w-px bg-white/10 mx-1" />
                  <select
                    onChange={(e) => e.target.value && handleBatchSetSubject(e.target.value)}
                    defaultValue=""
                    className="px-2 py-1 rounded bg-white/5 text-[11px] text-white border border-white/10"
                  >
                    <option value="" disabled>
                      Set Subject...
                    </option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="mathematics">Higher Math</option>
                    <option value="biology">Biology</option>
                    <option value="ict">ICT</option>
                  </select>
                  <select
                    onChange={(e) => e.target.value && handleBatchSetPaper(Number(e.target.value))}
                    defaultValue=""
                    className="px-2 py-1 rounded bg-white/5 text-[11px] text-white border border-white/10"
                  >
                    <option value="" disabled>
                      Set Paper...
                    </option>
                    <option value="1">1st Paper</option>
                    <option value="2">2nd Paper</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowRightsModal(true)}
                    className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30"
                  >
                    Set Rights...
                  </button>
                </div>
              )}
            </div>

            {/* Virtualized / Paginated Table */}
            <div className="bg-[#0B0F17] border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-white/50">
                      <th className="p-3 w-8">
                        <input
                          type="checkbox"
                          checked={
                            filteredJobs.length > 0 && selectedJobIds.size === filteredJobs.length
                          }
                          onChange={toggleSelectAll}
                          className="rounded border-white/20"
                        />
                      </th>
                      <th className="p-3 font-semibold">File & Detected Title</th>
                      <th className="p-3 font-semibold">Subject & Paper</th>
                      <th className="p-3 font-semibold">Stage & Progress</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Duplicate Check</th>
                      <th className="p-3 font-semibold">Rights</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-white/40">
                          No jobs found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((job) => {
                        const isSelected = selectedJobIds.has(job.id);
                        const book = job.result?.book;
                        const dup = job.duplicate_info || job.result?.duplicate_info;

                        return (
                          <tr
                            key={job.id}
                            className={`hover:bg-white/[0.02] transition-colors ${
                              isSelected ? 'bg-mint/[0.03]' : ''
                            }`}
                          >
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectJob(job.id)}
                                className="rounded border-white/20"
                              />
                            </td>
                            <td className="p-3 max-w-xs truncate">
                              <div className="font-bold text-white truncate">
                                {job.detected_title || book?.title || job.source_name}
                              </div>
                              <div className="text-[11px] text-white/40 font-mono truncate">
                                {job.source_name}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-white capitalize">
                                {job.subject_id || 'Unclassified'}
                              </div>
                              <div className="text-[11px] text-white/50">
                                Paper {job.paper_number || 1}
                              </div>
                            </td>
                            <td className="p-3 w-48">
                              <div className="flex justify-between text-[11px] text-white/60 mb-1">
                                <span className="capitalize">{job.stage}</span>
                                <span>{Math.round(job.progress)}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-mint"
                                  style={{ width: `${job.progress}%` }}
                                />
                              </div>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  job.status === 'published'
                                    ? 'bg-mint/20 text-mint'
                                    : job.status === 'ready_for_review'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : job.status === 'failed'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-cyan-500/20 text-cyan-300'
                                }`}
                              >
                                {job.status}
                              </span>
                            </td>
                            <td className="p-3">
                              {dup && dup.duplicate_type !== 'NONE' ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300">
                                  {dup.duplicate_type === 'EXACT_FILE_DUPLICATE'
                                    ? 'Exact Duplicate'
                                    : 'New Version'}
                                </span>
                              ) : (
                                <span className="text-[11px] text-white/30">Unique</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span
                                className={`text-[11px] font-semibold ${
                                  job.rights_status === 'UNVERIFIED'
                                    ? 'text-rose-400'
                                    : 'text-emerald-400'
                                }`}
                              >
                                {job.rights_status || 'UNVERIFIED'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => router.push(`/review?jobId=${job.id}`)}
                                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-colors"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BULK RIGHTS CONFIRMATION MODAL */}
        {showRightsModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#0B0F17] border border-white/15 rounded-3xl p-6 max-w-md w-full space-y-6">
              <div className="flex items-center gap-3 text-amber-400">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-base font-bold text-white">Bulk Rights Verification</h3>
              </div>

              <p className="text-xs text-white/70">
                You are about to assign rights status to {selectedJobIds.size} selected books.
                Rights cannot be automatically inferred by AI; distribution requires explicit operator authorization.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80">Select Rights Status:</label>
                <select
                  value={bulkRightsStatus}
                  onChange={(e) => setBulkRightsStatus(e.target.value as RightsStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                >
                  <option value="LICENSED">LICENSED — Licensed with publisher</option>
                  <option value="OWNED">OWNED — Content fully owned</option>
                  <option value="OPEN_LICENSE">OPEN_LICENSE — CC/Open license</option>
                  <option value="PUBLIC_DOMAIN">PUBLIC_DOMAIN — Public domain</option>
                  <option value="INTERNAL_ONLY">INTERNAL_ONLY — Private testing only</option>
                  <option value="UNVERIFIED">UNVERIFIED — Unverified (blocked from publish)</option>
                </select>
              </div>

              <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl text-xs text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bulkRightsConfirmed}
                  onChange={(e) => setBulkRightsConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-white/20"
                />
                <span>
                  I confirm that the operator possesses legal authorization or rights to distribute these {selectedJobIds.size} books.
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRightsModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!bulkRightsConfirmed}
                  onClick={handleConfirmBulkRights}
                  className="px-5 py-2 rounded-xl bg-mint text-ink font-bold text-xs disabled:opacity-40 hover:bg-mint/90 transition-colors"
                >
                  Apply Rights
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
