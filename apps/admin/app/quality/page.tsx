"use client";

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileCheck,
  Filter,
  ImageIcon,
  List,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  XCircle,
} from 'lucide-react';
import {
  ContentIssue,
  fetchIssues,
  fetchQualitySummary,
  QualitySummary,
  updateIssue,
} from '@/lib/api';

function QualityDashboardContent() {
  const router = useRouter();

  const [summary, setSummary] = useState<QualitySummary | null>(null);
  const [issues, setIssues] = useState<ContentIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('OPEN');

  const loadData = async () => {
    try {
      setLoading(true);
      const [sum, iss] = await Promise.all([
        fetchQualitySummary(),
        fetchIssues(undefined, statusFilter !== 'all' ? statusFilter : undefined),
      ]);
      setSummary(sum);
      setIssues(iss);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleResolveIssue = async (id: string) => {
    const notes = prompt('Enter resolution notes:');
    if (notes === null) return;
    await updateIssue(id, { status: 'FIXED', resolution_notes: notes });
    await loadData();
  };

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
              <span className="text-xs uppercase tracking-wider text-rose-400 font-bold">
                Quality Assurance & Issue Tracking
              </span>
              <h1 className="text-2xl font-black text-white">
                Content Quality Dashboard
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Metric Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div
            onClick={() => router.push('/books?status=DRAFT')}
            className="bg-[#0B0F17] border border-white/10 hover:border-mint p-4 rounded-2xl cursor-pointer transition-all space-y-1"
          >
            <div className="text-[10px] uppercase font-bold text-white/40">Total Drafts</div>
            <div className="text-xl font-black text-white">{summary?.draft_books || 0}</div>
            <div className="text-[10px] text-white/50">Unpublished</div>
          </div>

          <div
            onClick={() => router.push('/books?rights_status=UNVERIFIED')}
            className="bg-[#0B0F17] border border-white/10 hover:border-rose-400 p-4 rounded-2xl cursor-pointer transition-all space-y-1"
          >
            <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Unverified Rights
            </div>
            <div className="text-xl font-black text-rose-400">{summary?.rights_unverified || 0}</div>
            <div className="text-[10px] text-white/50">Blocks Publish</div>
          </div>

          <div
            onClick={() => router.push('/books')}
            className="bg-[#0B0F17] border border-white/10 hover:border-amber-400 p-4 rounded-2xl cursor-pointer transition-all space-y-1"
          >
            <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Missing Covers
            </div>
            <div className="text-xl font-black text-amber-400">{summary?.missing_covers || 0}</div>
            <div className="text-[10px] text-white/50">Needs candidate</div>
          </div>

          <div
            onClick={() => router.push('/books')}
            className="bg-[#0B0F17] border border-white/10 hover:border-amber-400 p-4 rounded-2xl cursor-pointer transition-all space-y-1"
          >
            <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
              <List className="w-3 h-3" /> Unmapped Chapters
            </div>
            <div className="text-xl font-black text-amber-400">{summary?.missing_chapters || 0}</div>
            <div className="text-[10px] text-white/50">Single section</div>
          </div>

          <div
            onClick={() => router.push('/books')}
            className="bg-[#0B0F17] border border-white/10 hover:border-cyan-400 p-4 rounded-2xl cursor-pointer transition-all space-y-1"
          >
            <div className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
              <Search className="w-3 h-3" /> Search Failures
            </div>
            <div className="text-xl font-black text-cyan-400">{summary?.search_failures || 0}</div>
            <div className="text-[10px] text-white/50">OCR unindexed</div>
          </div>

          <div
            onClick={() => router.push('/publishing')}
            className="bg-[#0B0F17] border border-white/10 hover:border-rose-400 p-4 rounded-2xl cursor-pointer transition-all space-y-1"
          >
            <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Broken Packages
            </div>
            <div className="text-xl font-black text-rose-400">{summary?.broken_packages || 0}</div>
            <div className="text-[10px] text-white/50">Rebuild needed</div>
          </div>
        </div>

        {/* Content Issues & Student Reports Section */}
        <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Content Quality Issues & Error Reports</h3>
              <p className="text-xs text-white/50">
                Issues reported by students in-app or detected during automated quality scans.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              >
                <option value="all">All Statuses</option>
                <option value="OPEN">Open Reports</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="FIXED">Resolved</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {issues.length === 0 ? (
              <div className="p-12 text-center text-white/40 text-xs">
                No content issues found matching filter.
              </div>
            ) : (
              issues.map((iss) => (
                <div
                  key={iss.id}
                  className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-400">{iss.category}</span>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white/70 font-mono text-[10px]">
                        {iss.priority}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40">
                      {new Date(iss.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-white/80">{iss.message}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="text-[11px] text-white/50">
                      Book ID: <span className="font-mono text-white/70">{iss.book_id}</span>
                      {iss.page_number && <span> • Page: {iss.page_number}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/books/${iss.book_id}`}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-white font-semibold text-[11px]"
                      >
                        Open Editor
                      </Link>
                      {iss.status !== 'FIXED' && (
                        <button
                          type="button"
                          onClick={() => handleResolveIssue(iss.id)}
                          className="px-3 py-1 bg-mint text-ink font-bold rounded-lg text-[11px]"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function QualityDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070A0F] text-white flex items-center justify-center">
          <div className="text-white/50 text-xs">Loading Quality Dashboard...</div>
        </div>
      }
    >
      <QualityDashboardContent />
    </Suspense>
  );
}
