import Link from 'next/link';
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  Database,
  FileCheck,
  FileUp,
  HardDrive,
  Layers,
  Library,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { UploadStudio } from '@/components/UploadStudio';

export default function Dashboard() {
  return (
    <main className="mx-auto min-h-screen max-w-[1500px] px-5 py-7 lg:px-9 lg:py-9">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-black uppercase tracking-[.24em] text-[#57E0B7]">
            HSC Study Platform
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-[-.04em] md:text-5xl">
            Admin Content Management <span className="text-white/25">/ Studio</span>
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/45">
            Manage textbooks, chapter mappings, versioning, legal rights, encrypted offline packages (HSCP), search indexes, and mobile delivery from one unified console.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/books"
            className="px-5 py-3 rounded-2xl bg-mint text-ink font-bold text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-mint/10"
          >
            <Library className="w-4 h-4" />
            Book Catalog
          </Link>
          <Link
            href="/publishing"
            className="px-4 py-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-2 hover:bg-cyan-500/30 transition-all"
          >
            <FileCheck className="w-4 h-4" />
            Publishing
          </Link>
          <Link
            href="/quality"
            className="px-4 py-3 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-2 hover:bg-rose-500/30 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            Quality Control
          </Link>
          <Link
            href="/imports/bulk"
            className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 font-bold text-xs flex items-center gap-2 transition-all"
          >
            <Workflow className="w-4 h-4" />
            Mass Ingestion
          </Link>
          <Link
            href="/review"
            className="px-4 py-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-2 hover:bg-amber-500/30 transition-all"
          >
            <BookOpenCheck className="w-4 h-4" />
            Review Queue
          </Link>
        </div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Library}
          label="Catalog Authority"
          value="Book Catalog"
          hint="Search, filters, metadata & provenance"
        />
        <MetricCard
          icon={Layers}
          label="Version Management"
          value="Non-Destructive"
          hint="Immutable sources, side-by-side diff & rollback"
        />
        <MetricCard
          icon={HardDrive}
          label="Secure Offline Reader"
          value="HSCP Packages"
          hint="AES-256-GCM encrypted delivery"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Rights Enforcement"
          value="Strict Gates"
          hint="Blocks UNVERIFIED student publication"
        />
      </section>

      <section className="mt-5">
        <UploadStudio />
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        {[
          [
            'Content Studio & Visual Editor',
            'Edit chapter boundaries with interactive 3-pane page thumbnail preview, OCR inspector, and split/merge tools.',
          ],
          [
            'Atomic Versioning & Rollback',
            'Every book edit creates non-destructive revisions. Version activation is an atomic pointer switch with 0-downtime rollback.',
          ],
          [
            'Production Quality Gates',
            'Scans for unverified rights, missing covers, unmapped chapters, search failures, and broken formula links before release.',
          ],
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
