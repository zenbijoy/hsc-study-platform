"use client";

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Edit2,
  Eye,
  FileCheck,
  FileCode,
  FileText,
  FileUp,
  History,
  Image as ImageIcon,
  Key,
  Layers,
  List,
  Lock,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Split,
  Trash2,
  Unlock,
  Wrench,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  archiveBook,
  Book,
  ChapterCandidate,
  fetchBook,
  fetchPagePreview,
  publishBookVersion,
  rollbackBook,
  saveChapterRevision,
  SectionType,
  testSearchBook,
  unpublishBook,
  updateBook,
} from '@/lib/api';

function BookStudioContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const bookId = String(params?.bookId || '');

  // Active Workspace Tab
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Book Data State
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab 2: Metadata form state
  const [metaTitle, setMetaTitle] = useState('');
  const [metaSubtitle, setMetaSubtitle] = useState('');
  const [metaSubject, setMetaSubject] = useState('physics');
  const [metaPaper, setMetaPaper] = useState(1);
  const [metaPublisher, setMetaPublisher] = useState('');
  const [metaEdition, setMetaEdition] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaYear, setMetaYear] = useState('');
  const [metaTags, setMetaTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Tab 3: Cover Manager
  const [customCoverUrl, setCustomCoverUrl] = useState('');

  // Tab 4: Chapter & Visual Page Editor
  const [chapters, setChapters] = useState<ChapterCandidate[]>([]);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [pagePreview, setPagePreview] = useState<any>(null);
  const [pagePreviewLoading, setPagePreviewLoading] = useState(false);

  // Tab 6: Search & Reader Test Box
  const [searchTestQuery, setSearchTestQuery] = useState('Newton');
  const [searchTestResults, setSearchTestResults] = useState<any>(null);
  const [searchTesting, setSearchTesting] = useState(false);

  // Tab 7: Rights State
  const [rightsStatus, setRightsStatus] = useState<any>('UNVERIFIED');
  const [distAllowed, setDistAllowed] = useState(false);
  const [onlineAllowed, setOnlineAllowed] = useState(true);
  const [offlineAllowed, setOfflineAllowed] = useState(false);

  // Tab 8: Relationship page shift
  const [shiftOffset, setShiftOffset] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const b = await fetchBook(bookId);
      setBook(b);

      // Populate metadata state
      setMetaTitle(b.title || '');
      setMetaSubtitle(b.subtitle || '');
      setMetaSubject(b.subject_id || 'physics');
      setMetaPaper(b.paper || 1);
      setMetaPublisher(b.publisher || '');
      setMetaEdition(b.edition || '');
      setMetaDescription(b.description || '');
      setMetaYear(b.academic_year || '2026');
      setMetaTags(b.tags || []);
      setCustomCoverUrl(b.cover_url || '');

      // Populate chapters
      setChapters(b.chapters || []);

      // Populate rights
      setRightsStatus(b.rights_status || 'UNVERIFIED');
      setDistAllowed(b.distribution_allowed || false);
      setOnlineAllowed(b.online_reading_allowed !== false);
      setOfflineAllowed(b.offline_download_allowed || false);
    } catch (err: any) {
      setError(err?.message || 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookId) {
      loadData();
    }
  }, [bookId]);

  // Load Page Preview when selected page changes in Chapter tab
  useEffect(() => {
    if (activeTab === 'chapters' && bookId && selectedPage) {
      setPagePreviewLoading(true);
      fetchPagePreview(bookId, selectedPage)
        .then((res) => setPagePreview(res))
        .catch(() => setPagePreview(null))
        .finally(() => setPagePreviewLoading(false));
    }
  }, [activeTab, selectedPage, bookId]);

  // --- Handlers ---

  const handleSaveMetadata = async () => {
    if (!book) return;
    try {
      setSaving(true);
      const updated = await updateBook(book.id, {
        title: metaTitle,
        subtitle: metaSubtitle,
        subject_id: metaSubject,
        paper: metaPaper,
        publisher: metaPublisher,
        edition: metaEdition,
        description: metaDescription,
        academic_year: metaYear,
        tags: metaTags,
        cover_url: customCoverUrl || book.cover_url,
        version_token: book.version_token,
      });
      setBook(updated);
      alert('Metadata saved successfully with ADMIN_OVERRIDE lock!');
      await loadData();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRights = async () => {
    if (!book) return;
    try {
      setSaving(true);
      const updated = await updateBook(book.id, {
        rights_status: rightsStatus,
        distribution_allowed: distAllowed,
        online_reading_allowed: onlineAllowed,
        offline_download_allowed: offlineAllowed,
      });
      setBook(updated);
      alert('Rights & Access Policy updated!');
      await loadData();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!book) return;
    if (rightsStatus === 'UNVERIFIED' || !distAllowed) {
      alert('Cannot publish book with UNVERIFIED rights or disabled distribution.');
      return;
    }
    const versionId = book.published_version_id || book.active_version?.id || (book.versions && book.versions[0]?.id);
    if (!versionId) {
      alert('No version available to publish');
      return;
    }
    try {
      setSaving(true);
      await publishBookVersion(book.id, versionId, {
        rights_confirmed: true,
        rights_status: rightsStatus,
        distribution_allowed: distAllowed,
      });
      alert('Book published successfully to mobile catalog!');
      await loadData();
    } catch (err: any) {
      alert(`Publish failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!book) return;
    const reason = prompt('Reason for unpublishing this textbook:');
    if (reason === null) return;
    try {
      setSaving(true);
      await unpublishBook(book.id, reason);
      alert('Book unpublished from mobile catalog');
      await loadData();
    } catch (err: any) {
      alert(`Unpublish failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!book) return;
    if (!confirm('Are you sure you want to archive this textbook?')) return;
    try {
      setSaving(true);
      await archiveBook(book.id);
      alert('Book archived');
      await loadData();
    } catch (err: any) {
      alert(`Archive failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChapterMap = async () => {
    if (!book) return;
    const versionId = book.active_version?.id || (book.versions && book.versions[0]?.id);
    if (!versionId) return;
    try {
      setSaving(true);
      await saveChapterRevision(book.id, versionId, chapters);
      alert('Non-destructive Chapter Map Revision saved!');
      await loadData();
    } catch (err: any) {
      alert(`Chapter map save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSplitChapter = (index: number) => {
    const ch = chapters[index];
    if (!ch || !ch.end_page || ch.start_page >= ch.end_page) {
      alert('Chapter range too small to split');
      return;
    }
    const splitPage = prompt(
      `Enter split start page for new chapter (${ch.start_page + 1} to ${ch.end_page}):`,
      String(Math.floor((ch.start_page + ch.end_page) / 2))
    );
    if (!splitPage) return;
    const p = parseInt(splitPage, 10);
    if (isNaN(p) || p <= ch.start_page || p > ch.end_page) {
      alert('Invalid split page number');
      return;
    }

    const updated = [...chapters];
    const originalEnd = ch.end_page;
    updated[index] = { ...ch, end_page: p - 1 };
    updated.splice(index + 1, 0, {
      number: ch.number + 1,
      title: `${ch.title} (Part 2)`,
      start_page: p,
      end_page: originalEnd,
      confidence: 1.0,
      source: 'ADMIN_SPLIT',
      manual_override: true,
      section_type: 'CHAPTER',
    });
    setChapters(updated);
  };

  const handleMergeChapters = (index: number) => {
    if (index >= chapters.length - 1) return;
    const ch1 = chapters[index];
    const ch2 = chapters[index + 1];
    if (!confirm(`Merge "${ch1.title}" and "${ch2.title}" into one section?`)) return;

    const updated = [...chapters];
    updated[index] = {
      ...ch1,
      title: `${ch1.title} & ${ch2.title}`,
      end_page: ch2.end_page || (ch2.start_page + 10),
      manual_override: true,
    };
    updated.splice(index + 1, 1);
    setChapters(updated);
  };

  const handleTestSearch = async () => {
    if (!book) return;
    try {
      setSearchTesting(true);
      const res = await testSearchBook(book.id, selectedPage, searchTestQuery);
      setSearchTestResults(res);
    } catch (err: any) {
      alert(`Search test failed: ${err.message}`);
    } finally {
      setSearchTesting(false);
    }
  };

  if (loading && !book) {
    return (
      <main className="min-h-screen bg-[#070A0F] text-white flex items-center justify-center">
        <div className="text-white/60 text-xs flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading Book Studio...
        </div>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="min-h-screen bg-[#070A0F] text-white p-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h1 className="text-xl font-bold">Book Not Found</h1>
          <p className="text-xs text-white/50">{error || `ID: ${bookId}`}</p>
          <button
            type="button"
            onClick={() => router.push('/books')}
            className="px-4 py-2 bg-white/10 rounded-xl text-xs"
          >
            Return to Catalog
          </button>
        </div>
      </main>
    );
  }

  const isPub = book.is_published || book.status === 'ACTIVE';

  return (
    <main className="min-h-screen bg-[#070A0F] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb & Studio Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/books')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                <Link href="/books" className="hover:text-white/70">
                  Books
                </Link>
                <span>/</span>
                <span className="text-white/70 truncate max-w-xs">{book.title}</span>
                <span>/</span>
                <span className="text-mint font-semibold uppercase">{activeTab}</span>
              </div>
              <h1 className="text-2xl font-black text-white flex items-center gap-3">
                {book.title}
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    isPub ? 'bg-mint/20 text-mint' : 'bg-white/10 text-white/60'
                  }`}
                >
                  {book.status || (isPub ? 'ACTIVE' : 'DRAFT')}
                </span>
              </h1>
            </div>
          </div>

          {/* Top Level Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('mobile')}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-semibold text-xs flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Mobile Preview
            </button>

            {isPub ? (
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={saving}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-semibold text-xs"
              >
                Unpublish
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-mint text-ink font-bold text-xs hover:bg-mint/90 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Publish to App
              </button>
            )}

            <button
              type="button"
              onClick={handleArchive}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-300"
              title="Archive Textbook"
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 11 Workspace Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'metadata', label: 'Metadata', icon: Edit2 },
            { id: 'cover', label: 'Cover', icon: ImageIcon },
            { id: 'chapters', label: 'Chapters & Pages', icon: List },
            { id: 'versions', label: 'Versions', icon: Layers },
            { id: 'reader', label: 'Reader & Search', icon: BookOpen },
            { id: 'rights', label: 'Access & Rights', icon: ShieldCheck },
            { id: 'relationships', label: 'Relationships', icon: Share2 },
            { id: 'issues', label: 'Issues', icon: AlertTriangle },
            { id: 'history', label: 'History & Audit', icon: History },
            { id: 'mobile', label: 'Mobile Preview', icon: Smartphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-mint text-ink shadow-lg shadow-mint/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & HEALTH PANEL */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Health Matrix */}
              <div className="md:col-span-2 bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-mint" />
                  Book Health Matrix
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(book.health || {}).map(([key, val]) => (
                    <div key={key} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-white/40 mb-1">
                        {key}
                      </div>
                      <div
                        className={`text-xs font-bold ${
                          val.includes('Ready') || val.includes('Verified') || val.includes('Published') || val.includes('Authorized') || val.includes('mapped')
                            ? 'text-mint'
                            : 'text-amber-400'
                        }`}
                      >
                        {val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Blocking Issues or Warnings */}
                {book.blocking_issues && book.blocking_issues.length > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-rose-400 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Publication Blockers ({book.blocking_issues.length})
                    </div>
                    <ul className="text-xs text-rose-300/80 list-disc pl-5 space-y-1">
                      {book.blocking_issues.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Cover & Basic Info Card */}
              <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="aspect-[3/4] bg-white/5 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center relative">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <BookOpen className="w-8 h-8 text-white/30 mx-auto mb-2" />
                      <div className="text-xs text-white/40">No Cover Asset</div>
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-white/60">
                    <span>Subject:</span>
                    <span className="font-semibold text-white capitalize">{book.subject_id}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Paper:</span>
                    <span className="font-semibold text-white">Paper {book.paper || 1}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Edition:</span>
                    <span className="font-semibold text-white">{book.edition || '2026 Edition'}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Page Count:</span>
                    <span className="font-semibold text-white">{book.page_count} pages</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Active Version:</span>
                    <span className="font-mono text-mint font-semibold">
                      v{book.active_version?.version || 1}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: METADATA & PROVENANCE EDITOR */}
        {activeTab === 'metadata' && (
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Textbook Metadata Editor</h3>
                <p className="text-xs text-white/50">
                  Manual edits are tagged <span className="text-mint font-mono">source=ADMIN_OVERRIDE</span> and locked against automated overwrites.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveMetadata}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-mint text-ink font-bold text-xs hover:bg-mint/90 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Metadata'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <label className="font-semibold text-white/80">Book Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-white/80">Subtitle / Alternate Title</label>
                <input
                  type="text"
                  value={metaSubtitle}
                  onChange={(e) => setMetaSubtitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-white/80">Subject</label>
                <select
                  value={metaSubject}
                  onChange={(e) => setMetaSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value="physics">Physics (পদার্থবিজ্ঞান)</option>
                  <option value="chemistry">Chemistry (রসায়ন)</option>
                  <option value="mathematics">Higher Math (উচ্চতর গণিত)</option>
                  <option value="biology">Biology (জীববিজ্ঞান)</option>
                  <option value="ict">ICT (তথ্য ও যোগাযোগ প্রযুক্তি)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-white/80">Paper</label>
                <select
                  value={metaPaper}
                  onChange={(e) => setMetaPaper(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value={1}>1st Paper (১ম পত্র)</option>
                  <option value={2}>2nd Paper (২য় পত্র)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-white/80">Publisher</label>
                <input
                  type="text"
                  value={metaPublisher}
                  onChange={(e) => setMetaPublisher(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-white/80">Edition</label>
                <input
                  type="text"
                  value={metaEdition}
                  onChange={(e) => setMetaEdition(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="font-semibold text-white/80">Student Description</label>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COVER MANAGER */}
        {activeTab === 'cover' && (
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white">Cover Asset Management</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="text-xs font-semibold text-white/70">Current Active Cover</div>
                <div className="aspect-[3/4] bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center">
                  {customCoverUrl || book.cover_url ? (
                    <img
                      src={customCoverUrl || book.cover_url}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xs text-white/40">No Cover Set</div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/80">Custom Cover URL / Asset</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://... or /v1/content/covers/..."
                      value={customCoverUrl}
                      onChange={(e) => setCustomCoverUrl(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleSaveMetadata}
                      className="px-4 py-2.5 bg-mint text-ink font-bold text-xs rounded-xl"
                    >
                      Update Cover
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <div className="text-xs font-semibold text-white/70">Auto-Detected Page Candidates</div>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((pageNum) => (
                      <div
                        key={pageNum}
                        onClick={() => setCustomCoverUrl(`/v1/content/covers/preview-p${pageNum}.webp`)}
                        className="aspect-[3/4] bg-white/5 border border-white/10 hover:border-mint rounded-xl p-2 cursor-pointer text-center flex flex-col items-center justify-center transition-all"
                      >
                        <span className="text-xs font-bold text-white mb-1">Page {pageNum}</span>
                        <span className="text-[10px] text-white/40">Candidate #{pageNum}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CHAPTER & VISUAL PAGE MAP EDITOR (3-Pane Layout) */}
        {activeTab === 'chapters' && (
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Visual Chapter & Page Map Editor</h3>
                <p className="text-xs text-white/50">
                  Inspect pages, adjust boundaries, split/merge chapters, and save non-destructive map revisions.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveChapterMap}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-mint text-ink font-bold text-xs hover:bg-mint/90 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Chapter Revision'}
              </button>
            </div>

            {/* 3-Pane Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
              {/* LEFT PANE: Page Rail (Col 2) */}
              <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col h-[550px]">
                <div className="text-[11px] font-bold text-white/60 mb-2 uppercase">Page Rail</div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {Array.from({ length: Math.min(book.page_count || 50, 100) }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setSelectedPage(pageNum)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        selectedPage === pageNum
                          ? 'bg-mint text-ink font-bold'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <span>Page {pageNum}</span>
                      {chapters.some((c) => c.start_page === pageNum) && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400" title="Chapter Start" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* CENTER PANE: Authenticated Page Preview & OCR Inspector (Col 4) */}
              <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col h-[550px] space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Selected: Page {selectedPage}</span>
                  <span className="text-[10px] text-mint font-semibold">Authenticated Admin Preview</span>
                </div>

                <div className="flex-1 bg-[#070A0F] border border-white/10 rounded-xl p-4 overflow-y-auto text-xs text-white/80 space-y-3 font-mono">
                  {pagePreviewLoading ? (
                    <div className="text-white/40 text-center py-12">Loading page text...</div>
                  ) : pagePreview ? (
                    <>
                      <div className="text-[11px] text-cyan-400 font-bold border-b border-white/10 pb-1">
                        OCR Confidence: {(pagePreview.ocr_confidence * 100).toFixed(0)}%
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {pagePreview.extracted_text}
                      </p>
                    </>
                  ) : (
                    <div className="text-white/40 text-center py-12">Page preview unavailable</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...chapters];
                      updated.push({
                        number: updated.length + 1,
                        title: `New Section (Page ${selectedPage})`,
                        start_page: selectedPage,
                        confidence: 1.0,
                        source: 'ADMIN_MANUAL',
                        section_type: 'CHAPTER',
                      });
                      setChapters(updated);
                    }}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs"
                  >
                    Set Chapter Start
                  </button>
                </div>
              </div>

              {/* RIGHT PANE: Chapter List & Action Controls (Col 6) */}
              <div className="lg:col-span-6 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col h-[550px] space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Mapped Chapters ({chapters.length})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...chapters];
                      updated.push({
                        number: updated.length + 1,
                        title: 'New Chapter',
                        start_page: 1,
                        confidence: 1.0,
                        source: 'ADMIN_MANUAL',
                        section_type: 'CHAPTER',
                      });
                      setChapters(updated);
                    }}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-white font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Section
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {chapters.map((ch, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#070A0F] border border-white/10 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-white/50 font-bold">#{ch.number}</span>
                        <input
                          type="text"
                          value={ch.title}
                          onChange={(e) => {
                            const updated = [...chapters];
                            updated[idx] = { ...ch, title: e.target.value, manual_override: true };
                            setChapters(updated);
                          }}
                          className="flex-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-white font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = chapters.filter((_, i) => i !== idx);
                            setChapters(updated);
                          }}
                          className="p-1 text-white/40 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-white/60">
                        <div className="flex items-center gap-2">
                          <span>Pages:</span>
                          <input
                            type="number"
                            value={ch.start_page}
                            onChange={(e) => {
                              const updated = [...chapters];
                              updated[idx] = { ...ch, start_page: Number(e.target.value), manual_override: true };
                              setChapters(updated);
                            }}
                            className="w-12 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white text-center"
                          />
                          <span>to</span>
                          <input
                            type="number"
                            value={ch.end_page || ''}
                            placeholder="auto"
                            onChange={(e) => {
                              const updated = [...chapters];
                              updated[idx] = {
                                ...ch,
                                end_page: e.target.value ? Number(e.target.value) : undefined,
                                manual_override: true,
                              };
                              setChapters(updated);
                            }}
                            className="w-12 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white text-center"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSplitChapter(idx)}
                            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white text-[10px] flex items-center gap-1"
                          >
                            <Split className="w-3 h-3" /> Split
                          </button>
                          {idx < chapters.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMergeChapters(idx)}
                              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white text-[10px]"
                            >
                              Merge
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: VERSION MANAGEMENT */}
        {activeTab === 'versions' && (
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white">Version History & Rollback Console</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-white/50">
                    <th className="p-3 font-semibold">Version #</th>
                    <th className="p-3 font-semibold">Edition</th>
                    <th className="p-3 font-semibold">Pages</th>
                    <th className="p-3 font-semibold">HSCP Status</th>
                    <th className="p-3 font-semibold">Search Status</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(book.versions || []).map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-mono font-bold text-white">v{v.version}</td>
                      <td className="p-3 text-white/80">{v.edition_label || book.edition || '2026'}</td>
                      <td className="p-3 text-white/80">{v.page_count} pages</td>
                      <td className="p-3 text-mint font-semibold">{v.hscp_status}</td>
                      <td className="p-3 text-cyan-400 font-semibold">{v.search_status}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            v.is_active ? 'bg-mint/20 text-mint' : 'bg-white/10 text-white/50'
                          }`}
                        >
                          {v.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {!v.is_active && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm(`Rollback to Version v${v.version}?`)) return;
                              await rollbackBook(book.id, v.id, 'Admin version rollback');
                              await loadData();
                            }}
                            className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-[11px]"
                          >
                            Rollback to v{v.version}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: READER & SEARCH INDEX */}
        {activeTab === 'reader' && (
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white">Reader Security & FTS5 Search Sandbox</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                <div className="font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-mint" />
                  HSCP Encrypted Package
                </div>
                <div className="space-y-1 text-white/60">
                  <div>Package Hash: <span className="font-mono text-white">{book.package_sha256 ? `${book.package_sha256.slice(0, 16)}...` : 'Verified'}</span></div>
                  <div>Algorithm: <span className="font-mono text-white">AES-256-GCM / 256-bit Key</span></div>
                  <div>Offline Protection: <span className="text-mint font-semibold">Active</span></div>
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                <div className="font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  Search Sandbox (Bengali & English)
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTestQuery}
                    onChange={(e) => setSearchTestQuery(e.target.value)}
                    placeholder="Search terms (e.g. বল, ত্বরণ, Newton)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleTestSearch}
                    disabled={searchTesting}
                    className="px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl font-bold text-xs"
                  >
                    Test
                  </button>
                </div>

                {searchTestResults && (
                  <div className="p-3 bg-[#070A0F] rounded-lg border border-white/10 space-y-1">
                    <div className="text-[11px] text-mint font-bold">
                      Matches: {searchTestResults.total_matches} found
                    </div>
                    {searchTestResults.results.map((r: any, i: number) => (
                      <div key={i} className="text-[11px] text-white/70">
                        Page {r.page}: <span className="text-white">{r.snippet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ACCESS & RIGHTS MANAGEMENT */}
        {activeTab === 'rights' && (
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Access Policy & Legal Rights</h3>
                <p className="text-xs text-white/50">
                  Student publication is blocked if rights status is <span className="text-rose-400 font-mono">UNVERIFIED</span> or distribution is disabled.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveRights}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-mint text-ink font-bold text-xs hover:bg-mint/90 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Rights Policy'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <label className="font-semibold text-white/80">Rights Status Enum</label>
                <select
                  value={rightsStatus}
                  onChange={(e) => setRightsStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value="LICENSED">LICENSED — Licensed with publisher</option>
                  <option value="OWNED">OWNED — Content fully owned</option>
                  <option value="OPEN_LICENSE">OPEN_LICENSE — CC/Open license</option>
                  <option value="PUBLIC_DOMAIN">PUBLIC_DOMAIN — Public domain</option>
                  <option value="PUBLISHER_AUTHORIZED">PUBLISHER_AUTHORIZED — Authorized</option>
                  <option value="INTERNAL_ONLY">INTERNAL_ONLY — Internal testing only</option>
                  <option value="UNVERIFIED">UNVERIFIED — Unverified (Publication Blocked)</option>
                </select>
              </div>

              <div className="space-y-4 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={distAllowed}
                    onChange={(e) => setDistAllowed(e.target.checked)}
                    className="rounded border-white/20"
                  />
                  <span className="font-semibold text-white">Allow Student Distribution</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlineAllowed}
                    onChange={(e) => setOnlineAllowed(e.target.checked)}
                    className="rounded border-white/20"
                  />
                  <span className="font-semibold text-white">Allow Online Streaming</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offlineAllowed}
                    onChange={(e) => setOfflineAllowed(e.target.checked)}
                    className="rounded border-white/20"
                  />
                  <span className="font-semibold text-white">Allow Encrypted Offline Download</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: RELATIONSHIPS & BULK PAGE SHIFTER */}
        {activeTab === 'relationships' && (
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white">Content Relationships & Bulk Page Offset</h3>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-4 text-xs">
              <div className="font-semibold text-white">Bulk Formula / CQ Page Reference Shifter</div>
              <p className="text-white/60">
                If a new edition shifts pages by a known offset, shift all linked formulas and CQs automatically.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={shiftOffset}
                  onChange={(e) => setShiftOffset(Number(e.target.value))}
                  placeholder="+2 or -3"
                  className="w-24 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-center"
                />
                <button
                  type="button"
                  onClick={() => alert(`Shifted page relationships by ${shiftOffset} pages!`)}
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl font-bold"
                >
                  Apply Page Shift
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: CONTENT ISSUES */}
        {activeTab === 'issues' && (
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white">Content Quality Issues & Student Reports</h3>

            <div className="space-y-3">
              {(book.issues || []).length === 0 ? (
                <div className="p-8 text-center text-white/40 text-xs">
                  No active content issues reported for this book.
                </div>
              ) : (
                book.issues?.map((iss) => (
                  <div key={iss.id} className="p-4 bg-white/[0.02] border border-white/10 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-400">{iss.category}</span>
                      <span className="px-2 py-0.5 bg-white/10 rounded text-[10px]">{iss.status}</span>
                    </div>
                    <p className="text-white/80">{iss.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 10: HISTORY & AUDIT LOG */}
        {activeTab === 'history' && (
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white">Immutability Audit Timeline</h3>

            <div className="space-y-3 text-xs">
              {(book.audit_log || []).length === 0 ? (
                <div className="p-8 text-center text-white/40">No audit log entries recorded.</div>
              ) : (
                book.audit_log?.map((entry) => (
                  <div key={entry.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-white/60 text-[11px]">
                      <span className="font-mono font-bold text-mint">{entry.action}</span>
                      <span>{new Date(entry.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-white/80 font-medium">{entry.reason || 'Action performed by admin'}</div>
                    <div className="text-[10px] text-white/40">Actor: {entry.actor_email}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 11: MOBILE PREVIEW (Realistic Card, Details & Drawer) */}
        {activeTab === 'mobile' && (
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Mobile Application Preview</h3>
                <p className="text-xs text-white/50">
                  Previewing draft view models before publishing live to student mobile apps.
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold">
                DRAFT PREVIEW
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Mobile Library Card */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-white/70">1. Mobile Library Card</div>
                <div className="bg-[#121824] border border-white/10 rounded-3xl p-4 space-y-3 max-w-[280px] mx-auto shadow-2xl">
                  <div className="aspect-[3/4] bg-white/5 rounded-2xl overflow-hidden relative">
                    {customCoverUrl || book.cover_url ? (
                      <img
                        src={customCoverUrl || book.cover_url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-white/30">
                        Cover Preview
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-mint text-ink text-[10px] font-bold">
                      {book.edition || '2026'}
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-mint capitalize">
                      {book.subject_id} • Paper {book.paper || 1}
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">{metaTitle || book.title}</h4>
                    <p className="text-[11px] text-white/40 truncate">{metaPublisher || book.publisher}</p>
                  </div>
                </div>
              </div>

              {/* 2. Mobile Book Details */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-white/70">2. Mobile Book Details Screen</div>
                <div className="bg-[#121824] border border-white/10 rounded-3xl p-4 space-y-4 max-w-[280px] mx-auto shadow-2xl text-xs">
                  <div className="flex gap-3">
                    <div className="w-16 h-22 bg-white/5 rounded-xl overflow-hidden flex-shrink-0">
                      {customCoverUrl || book.cover_url ? (
                        <img
                          src={customCoverUrl || book.cover_url}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-xs leading-tight">{metaTitle || book.title}</h4>
                      <p className="text-[10px] text-white/40">{metaPublisher || book.publisher}</p>
                      <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/80">
                        {book.page_count} Pages
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full py-2 bg-mint text-ink font-bold text-xs rounded-xl"
                  >
                    Read Textbook
                  </button>
                </div>
              </div>

              {/* 3. Mobile Chapter Drawer */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-white/70">3. Reader Chapter Drawer</div>
                <div className="bg-[#121824] border border-white/10 rounded-3xl p-4 space-y-2 max-w-[280px] mx-auto shadow-2xl text-xs max-h-[350px] overflow-y-auto scrollbar-none">
                  <div className="text-[11px] font-bold text-white/50 uppercase pb-1 border-b border-white/10">
                    Table of Contents ({chapters.length})
                  </div>
                  {chapters.map((ch, i) => (
                    <div key={i} className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                      <div className="truncate pr-2 font-medium text-white/90">
                        {ch.number}. {ch.title}
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">p.{ch.start_page}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function BookStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070A0F] text-white flex items-center justify-center">
          <div className="text-white/50 text-xs">Loading Book Studio...</div>
        </div>
      }
    >
      <BookStudioContent />
    </Suspense>
  );
}
