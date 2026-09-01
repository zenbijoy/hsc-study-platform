import Link from 'next/link';
import { BookOpenCheck, Database, FileUp, HardDrive, Workflow } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { UploadStudio } from '@/components/UploadStudio';

export default function Dashboard() {
  return (
    <main className="mx-auto min-h-screen max-w-[1500px] px-5 py-7 lg:px-9 lg:py-9">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-black uppercase tracking-[.24em] text-[#57E0B7]">HSC Study Platform</div>
          <h1 className="mt-3 text-4xl font-black tracking-[-.04em] md:text-5xl">
            Content Factory <span className="text-white/25">/ Admin</span>
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/45">
            One automated pipeline for books, formulas, CQ/MCQ, search packs, secure offline packages and AI-generated structured imports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/books/import"
            className="px-5 py-3 rounded-2xl bg-mint text-ink font-bold text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-mint/10"
          >
            <FileUp className="w-4 h-4" />
            PDF Upload Studio
          </Link>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs text-white/45">
            Zero-cost dev mode · Local worker fallback
          </div>
        </div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={HardDrive} label="Origin storage" value="Drive / Local" hint="Large files stay outside Postgres" />
        <MetricCard icon={Database} label="Database role" value="Catalog" hint="Metadata, relations and user state" />
        <MetricCard icon={Workflow} label="Ingestion" value="Automated" hint="Idempotent, versioned, reviewable" />
        <MetricCard icon={BookOpenCheck} label="Reader delivery" value="HSCP" hint="Encrypted app-only offline packages" />
      </section>

      <section className="mt-5"><UploadStudio /></section>

      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        {[
          ['Universal importer', 'Agents output JSONL, never React/SQL. Validation and dedupe decide what becomes publishable.'],
          ['Atomic versions', 'Every import is a draft version. Publish is a pointer switch; rollback is immediate.'],
          ['Canonical syllabus', 'Books, formulas and questions map onto one syllabus graph instead of duplicating publisher-specific structures.'],
        ].map(([title, body]) => (
          <div key={title} className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6">
            <h3 className="text-lg font-black">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/40">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
