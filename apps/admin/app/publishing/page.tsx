"use client";

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  FileCheck,
  History,
  Layers,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  Book,
  fetchBooks,
  publishBulk,
  publishBookVersion,
  RightsStatus,
  unpublishBook,
  validatePublish,
} from '@/lib/api';

function PublishingConsoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'ready' | 'blocked' | 'published' | 'updates'>('ready');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Rights confirmation for bulk publish
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetchBooks({ limit: 100 });
      setBooks(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const readyBooks = books.filter(
    (b) => !b.is_published && b.rights_status !== 'UNVERIFIED' && b.distribution_allowed && b.reader_ready
  );

  const blockedBooks = books.filter(
    (b) =>
      !b.is_published &&
      (b.rights_status === 'UNVERIFIED' || !b.distribution_allowed || !b.reader_ready)
  );

  const publishedBooks = books.filter((b) => b.is_published || b.status === 'ACTIVE');

  const updateAvailableBooks = books.filter(
    (b) => b.is_published && b.versions && b.versions.length > 1 && !b.versions[b.versions.length - 1].is_active
  );

  const displayedBooks =
    activeTab === 'ready'
      ? readyBooks
      : activeTab === 'blocked'
      ? blockedBooks
      : activeTab === 'updates'
      ? updateAvailableBooks
      : publishedBooks;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkPublish = async () => {
    if (!rightsConfirmed || selectedIds.size === 0) return;
    try {
      setPublishing(true);
      const res = await publishBulk({
        book_ids: Array.from(selectedIds),
        rights_confirmed: true,
        rights_status: 'LICENSED',
        distribution_allowed: true,
      });
      alert(`Published ${res.published_count} books to mobile catalog!`);
      setSelectedIds(new Set());
      setRightsConfirmed(false);
      await loadCatalog();
    } catch (err: any) {
      alert(`Publication failed: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070A0F] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
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
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">
                Quality Gate & Release Console
              </span>
              <h1 className="text-2xl font-black text-white">
                Textbook Publishing Console
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={loadCatalog}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          {[
            { id: 'ready', label: `Ready to Publish (${readyBooks.length})`, icon: CheckCircle2, color: 'text-mint' },
            { id: 'blocked', label: `Blocked (${blockedBooks.length})`, icon: ShieldAlert, color: 'text-rose-400' },
            { id: 'published', label: `Published (${publishedBooks.length})`, icon: BookOpen, color: 'text-cyan-400' },
            { id: 'updates', label: `Updates Available (${updateAvailableBooks.length})`, icon: Layers, color: 'text-amber-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedIds(new Set());
                }}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                  isActive ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Bulk Action Strip for Ready Books */}
        {activeTab === 'ready' && readyBooks.length > 0 && (
          <div className="bg-[#0B0F17] border border-mint/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <label className="flex items-center gap-3 cursor-pointer text-xs text-white/80">
              <input
                type="checkbox"
                checked={rightsConfirmed}
                onChange={(e) => setRightsConfirmed(e.target.checked)}
                className="rounded border-white/20"
              />
              <span>
                I legally confirm distribution rights for selected books to be released live to student mobile catalog.
              </span>
            </label>

            <button
              type="button"
              disabled={!rightsConfirmed || selectedIds.size === 0 || publishing}
              onClick={handleBulkPublish}
              className="px-5 py-2.5 rounded-xl bg-mint text-ink font-bold text-xs hover:bg-mint/90 transition-all disabled:opacity-30 flex items-center gap-2 whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              Publish {selectedIds.size} Selected Books
            </button>
          </div>
        )}

        {/* Table of Books */}
        <div className="bg-[#0B0F17] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-white/50">
                  {activeTab === 'ready' && <th className="p-3 w-8" />}
                  <th className="p-3 font-semibold">Book Title</th>
                  <th className="p-3 font-semibold">Subject & Paper</th>
                  <th className="p-3 font-semibold">Rights Status</th>
                  <th className="p-3 font-semibold">HSCP Security</th>
                  <th className="p-3 font-semibold">Status / Issues</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayedBooks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-white/40">
                      No books found in this publishing section.
                    </td>
                  </tr>
                ) : (
                  displayedBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-white/[0.02]">
                      {activeTab === 'ready' && (
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(book.id)}
                            onChange={() => toggleSelect(book.id)}
                            className="rounded border-white/20"
                          />
                        </td>
                      )}
                      <td className="p-3 font-bold text-white max-w-sm truncate">
                        {book.title}
                        <div className="text-[11px] text-white/40 font-normal">
                          {book.publisher || 'NCTB Approved'} • {book.page_count} pages
                        </div>
                      </td>
                      <td className="p-3 capitalize font-semibold text-white/80">
                        {book.subject_id} • Paper {book.paper || 1}
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-semibold ${
                            book.rights_status === 'UNVERIFIED' ? 'text-rose-400' : 'text-mint'
                          }`}
                        >
                          {book.rights_status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            book.reader_ready ? 'bg-mint/20 text-mint' : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {book.reader_ready ? 'AES-256-GCM READY' : 'PACKAGE MISSING'}
                        </span>
                      </td>
                      <td className="p-3">
                        {activeTab === 'blocked' ? (
                          <span className="text-rose-400 font-semibold text-[11px]">
                            {book.rights_status === 'UNVERIFIED'
                              ? 'Rights Unverified'
                              : !book.reader_ready
                              ? 'Package Missing'
                              : 'Distribution Not Allowed'}
                          </span>
                        ) : (
                          <span className="text-white/60 text-[11px]">{book.status}</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/books/${book.id}`}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-colors"
                        >
                          Manage Book
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PublishingConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070A0F] text-white flex items-center justify-center">
          <div className="text-white/50 text-xs">Loading Publishing Console...</div>
        </div>
      }
    >
      <PublishingConsoleContent />
    </Suspense>
  );
}
