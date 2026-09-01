"use client";

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileCheck,
  FileUp,
  Filter,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Workflow,
  XCircle,
} from 'lucide-react';
import {
  archiveBook,
  batchMutate,
  Book,
  BookStatus,
  fetchBooks,
  publishBulk,
  RightsStatus,
  unpublishBook,
  validatePublish,
} from '@/lib/api';

function BooksCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 25;
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [subjectId, setSubjectId] = useState(searchParams.get('subject_id') || 'all');
  const [paper, setPaper] = useState<number>(Number(searchParams.get('paper')) || 0);
  const [rightsStatus, setRightsStatus] = useState(searchParams.get('rights_status') || 'all');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Bulk rights modal
  const [showRightsModal, setShowRightsModal] = useState(false);
  const [bulkRights, setBulkRights] = useState<RightsStatus>('LICENSED');
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  // Validation & publish state
  const [validating, setValidating] = useState(false);
  const [validationSummary, setValidationSummary] = useState<any>(null);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const res = await fetchBooks({
        offset,
        limit,
        search: search.trim() || undefined,
        status: status !== 'all' ? status : undefined,
        subject_id: subjectId !== 'all' ? subjectId : undefined,
        paper: paper !== 0 ? paper : undefined,
        rights_status: rightsStatus !== 'all' ? rightsStatus : undefined,
      });
      setBooks(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [offset, status, subjectId, paper, rightsStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(0);
      loadBooks();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Selection helpers
  const toggleSelectAll = () => {
    if (selectedIds.size === books.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(books.map((b) => b.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Bulk Actions
  const handleBulkSubject = async (subj: string) => {
    if (!selectedIds.size) return;
    await batchMutate({ book_ids: Array.from(selectedIds), subject_id: subj });
    await loadBooks();
  };

  const handleBulkPaper = async (pap: number) => {
    if (!selectedIds.size) return;
    await batchMutate({ book_ids: Array.from(selectedIds), paper_number: pap });
    await loadBooks();
  };

  const handleApplyBulkRights = async () => {
    if (!rightsConfirmed || !selectedIds.size) return;
    await batchMutate({
      book_ids: Array.from(selectedIds),
      rights_status: bulkRights,
      distribution_allowed: bulkRights !== 'UNVERIFIED',
    });
    setShowRightsModal(false);
    setRightsConfirmed(false);
    await loadBooks();
  };

  const handleBulkValidate = async () => {
    if (!selectedIds.size) return;
    try {
      setValidating(true);
      const res = await validatePublish({ book_ids: Array.from(selectedIds) });
      setValidationSummary(res);
    } catch (err: any) {
      alert(`Validation failed: ${err?.message}`);
    } finally {
      setValidating(false);
    }
  };

  const handleBulkPublish = async () => {
    const readyIds = validationSummary?.results.filter((r: any) => r.ready).map((r: any) => r.id) || [];
    if (!readyIds.length) return;
    try {
      setLoading(true);
      const res = await publishBulk({
        book_ids: readyIds,
        rights_confirmed: true,
        rights_status: 'LICENSED',
        distribution_allowed: true,
      });
      alert(`Published ${res.published_count} books to mobile catalog!`);
      setValidationSummary(null);
      setSelectedIds(new Set());
      await loadBooks();
    } catch (err: any) {
      alert(`Bulk publish failed: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkArchive = async () => {
    if (!confirm(`Are you sure you want to archive ${selectedIds.size} books?`)) return;
    for (const id of selectedIds) {
      await archiveBook(id);
    }
    setSelectedIds(new Set());
    await loadBooks();
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <main className="min-h-screen bg-[#070A0F] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
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
                Content Management System
              </span>
              <h1 className="text-2xl font-black text-white">
                Book Catalog Manager
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/publishing"
              className="px-4 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-bold text-xs border border-cyan-500/30 flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Publishing Console
            </Link>
            <Link
              href="/imports/bulk"
              className="px-4 py-2.5 rounded-xl bg-mint text-ink font-bold text-xs hover:bg-mint/90 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Import New Books
            </Link>
            <button
              type="button"
              onClick={loadBooks}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Validation Dry-run Result Alert */}
        {validationSummary && (
          <div className="bg-[#0B0F17] border border-cyan-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-mint" />
                <div>
                  <h3 className="text-base font-bold text-white">Bulk Publish Validation Result</h3>
                  <p className="text-xs text-white/60">
                    Selected: {validationSummary.total_selected} •{' '}
                    <span className="text-mint font-bold">Ready to Publish: {validationSummary.ready_count}</span> •{' '}
                    <span className="text-rose-400 font-bold">Blocked: {validationSummary.blocked_count}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setValidationSummary(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white/70 text-xs font-semibold"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  disabled={loading || validationSummary.ready_count === 0}
                  onClick={handleBulkPublish}
                  className="px-5 py-2 rounded-xl bg-mint text-ink font-bold text-xs hover:bg-mint/90 transition-colors disabled:opacity-40"
                >
                  Publish {validationSummary.ready_count} Ready Books
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters Toolbar */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[300px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by title, publisher, subject, edition, book ID, or hash..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0B0F17] border border-white/10 text-xs text-white placeholder:text-white/30"
                />
              </div>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setOffset(0);
                }}
                className="px-3 py-2.5 rounded-xl bg-[#0B0F17] border border-white/10 text-xs text-white"
              >
                <option value="all">All Statuses</option>
                <option value="ACTIVE">Published (Active)</option>
                <option value="DRAFT">Draft</option>
                <option value="UNPUBLISHED">Unpublished</option>
                <option value="ARCHIVED">Archived</option>
              </select>

              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setOffset(0);
                }}
                className="px-3 py-2.5 rounded-xl bg-[#0B0F17] border border-white/10 text-xs text-white"
              >
                <option value="all">All Subjects</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="mathematics">Higher Math</option>
                <option value="biology">Biology</option>
                <option value="ict">ICT</option>
              </select>

              <select
                value={paper}
                onChange={(e) => {
                  setPaper(Number(e.target.value));
                  setOffset(0);
                }}
                className="px-3 py-2.5 rounded-xl bg-[#0B0F17] border border-white/10 text-xs text-white"
              >
                <option value="0">All Papers</option>
                <option value="1">1st Paper</option>
                <option value="2">2nd Paper</option>
              </select>

              <select
                value={rightsStatus}
                onChange={(e) => {
                  setRightsStatus(e.target.value);
                  setOffset(0);
                }}
                className="px-3 py-2.5 rounded-xl bg-[#0B0F17] border border-white/10 text-xs text-white"
              >
                <option value="all">All Rights</option>
                <option value="LICENSED">LICENSED</option>
                <option value="OWNED">OWNED</option>
                <option value="OPEN_LICENSE">OPEN_LICENSE</option>
                <option value="PUBLIC_DOMAIN">PUBLIC_DOMAIN</option>
                <option value="UNVERIFIED">UNVERIFIED</option>
              </select>
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 bg-[#0B0F17] border border-white/15 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-mint">{selectedIds.size} Selected</span>
                <div className="h-4 w-px bg-white/10 mx-1" />
                <select
                  onChange={(e) => e.target.value && handleBulkSubject(e.target.value)}
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
                  onChange={(e) => e.target.value && handleBulkPaper(Number(e.target.value))}
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
                <button
                  type="button"
                  onClick={handleBulkValidate}
                  className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 text-[11px] font-bold border border-cyan-500/30"
                >
                  Validate
                </button>
                <button
                  type="button"
                  onClick={handleBulkArchive}
                  className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30"
                >
                  Archive
                </button>
              </div>
            )}
          </div>

          {/* Book Catalog Table */}
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-white/50">
                    <th className="p-3 w-8">
                      <input
                        type="checkbox"
                        checked={books.length > 0 && selectedIds.size === books.length}
                        onChange={toggleSelectAll}
                        className="rounded border-white/20"
                      />
                    </th>
                    <th className="p-3 font-semibold">Book & Publisher</th>
                    <th className="p-3 font-semibold">Subject & Paper</th>
                    <th className="p-3 font-semibold">Edition / Pages</th>
                    <th className="p-3 font-semibold">Version</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Rights</th>
                    <th className="p-3 font-semibold">Reader / Search</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {books.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-white/40">
                        No books found in catalog matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    books.map((book) => {
                      const isSelected = selectedIds.has(book.id);
                      const isPub = book.is_published || book.status === 'ACTIVE';

                      return (
                        <tr
                          key={book.id}
                          className={`hover:bg-white/[0.02] transition-colors ${
                            isSelected ? 'bg-mint/[0.03]' : ''
                          }`}
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(book.id)}
                              className="rounded border-white/20"
                            />
                          </td>
                          <td className="p-3 max-w-sm">
                            <div className="font-bold text-white truncate text-sm">
                              {book.title}
                            </div>
                            <div className="text-[11px] text-white/40 truncate">
                              {book.publisher || 'NCTB Approved'} • ID: {book.id.slice(0, 8)}...
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-white capitalize">
                              {book.subject_id}
                            </div>
                            <div className="text-[11px] text-white/50">
                              Paper {book.paper || 1}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-white font-medium">
                              {book.edition || '2026 Edition'}
                            </div>
                            <div className="text-[11px] text-white/40">
                              {book.page_count || 0} pages
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-white/5 text-white/70 font-mono text-[11px]">
                              v{book.active_version?.version || 1}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                isPub
                                  ? 'bg-mint/20 text-mint'
                                  : book.status === 'ARCHIVED'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : book.status === 'UNPUBLISHED'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-white/10 text-white/70'
                              }`}
                            >
                              {book.status || (isPub ? 'ACTIVE' : 'DRAFT')}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[11px] font-semibold ${
                                book.rights_status === 'UNVERIFIED'
                                  ? 'text-rose-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {book.rights_status || 'UNVERIFIED'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded ${
                                  book.reader_ready
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-rose-500/20 text-rose-300'
                                }`}
                              >
                                HSCP
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded ${
                                  book.search_ready
                                    ? 'bg-cyan-500/20 text-cyan-300'
                                    : 'bg-white/5 text-white/30'
                                }`}
                              >
                                FTS5
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => router.push(`/books/${book.id}`)}
                              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-colors"
                            >
                              Manage Book
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-4 border-t border-white/10 text-xs text-white/60">
              <div>
                Showing {books.length > 0 ? offset + 1 : 0} to{' '}
                {Math.min(offset + limit, total)} of {total} books
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={offset <= 0}
                  onClick={() => setOffset((o) => Math.max(0, o - limit))}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={offset + limit >= total}
                  onClick={() => setOffset((o) => o + limit)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Rights Modal */}
        {showRightsModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#0B0F17] border border-white/15 rounded-3xl p-6 max-w-md w-full space-y-6">
              <div className="flex items-center gap-3 text-amber-400">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-base font-bold text-white">Bulk Rights Assignment</h3>
              </div>

              <p className="text-xs text-white/70">
                You are modifying rights status for {selectedIds.size} selected books in the catalog.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80">Select Rights Status:</label>
                <select
                  value={bulkRights}
                  onChange={(e) => setBulkRights(e.target.value as RightsStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                >
                  <option value="LICENSED">LICENSED — Licensed with publisher</option>
                  <option value="OWNED">OWNED — Content fully owned</option>
                  <option value="OPEN_LICENSE">OPEN_LICENSE — CC/Open license</option>
                  <option value="PUBLIC_DOMAIN">PUBLIC_DOMAIN — Public domain</option>
                  <option value="UNVERIFIED">UNVERIFIED — Unverified (blocked from publish)</option>
                </select>
              </div>

              <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl text-xs text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rightsConfirmed}
                  onChange={(e) => setRightsConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-white/20"
                />
                <span>
                  I confirm that the operator possesses legal authorization or rights to distribute these {selectedIds.size} books.
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
                  disabled={!rightsConfirmed}
                  onClick={handleApplyBulkRights}
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

export default function BooksCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070A0F] text-white flex items-center justify-center">
          <div className="text-white/50 text-xs">Loading Catalog...</div>
        </div>
      }
    >
      <BooksCatalogContent />
    </Suspense>
  );
}
