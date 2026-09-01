-- Migration 0010: Content Factory Bulk Import, Import Groups, Canonical Chapters, and Drive Inbox

-- 1. Import Groups table for tracking mass ingestion batches
create table if not exists public.import_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null check (source_type in ('browser_upload','local_folder','drive_inbox','cli','api')),
  status text not null default 'active' check (status in ('active','completed','paused','cancelled','archived')),
  total_files int not null default 0,
  processed_files int not null default 0,
  published_files int not null default 0,
  failed_files int not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.import_groups enable row level security;

-- 2. Canonical Chapters Dictionary for NCTB syllabus
create table if not exists public.canonical_chapters (
  id text primary key,
  subject_id text not null references public.subjects(id) on delete cascade,
  paper int not null check (paper in (1, 2)),
  chapter_number int not null,
  title_bn text not null,
  title_en text not null,
  aliases jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (subject_id, paper, chapter_number)
);

alter table public.canonical_chapters enable row level security;

-- 3. Google Drive Inbox discovery state tracking table
create table if not exists public.drive_inbox_items (
  drive_file_id text primary key,
  name text not null,
  size bigint not null default 0,
  mime_type text not null default 'application/pdf',
  modified_time text,
  revision text,
  source_hash text,
  import_job_id text,
  status text not null default 'discovered' check (status in ('discovered','queued','processing','imported','ignored','error')),
  discovered_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.drive_inbox_items enable row level security;

-- 4. OCR Page Cache table (reusable OCR extraction by hash + page + engine)
create table if not exists public.ocr_cache (
  id uuid primary key default gen_random_uuid(),
  source_hash text not null,
  page_number int not null,
  ocr_engine_version text not null,
  language text not null default 'bn+en',
  extracted_text text not null,
  confidence numeric(4,3) default 0.900,
  created_at timestamptz not null default now(),
  unique (source_hash, page_number, ocr_engine_version, language)
);

alter table public.ocr_cache enable row level security;

-- 5. Book provenance and classification fields
alter table public.books
  add column if not exists import_group_id uuid references public.import_groups(id) on delete set null,
  add column if not exists classification_confidence jsonb default '{}'::jsonb,
  add column if not exists classification_provenance jsonb default '{}'::jsonb,
  add column if not exists metadata_locked_by_admin boolean not null default false,
  add column if not exists chapters_locked_by_admin boolean not null default false;

alter table public.book_versions
  add column if not exists cover_candidates jsonb default '[]'::jsonb,
  add column if not exists selected_cover_page int default 1;

-- 6. Performance indexes for Content Factory querying
create index if not exists idx_import_groups_status on public.import_groups(status, created_at desc);
create index if not exists idx_canonical_chapters_lookup on public.canonical_chapters(subject_id, paper, chapter_number);
create index if not exists idx_drive_inbox_status on public.drive_inbox_items(status, discovered_at desc);
create index if not exists idx_ocr_cache_lookup on public.ocr_cache(source_hash, page_number);
create index if not exists idx_books_import_group on public.books(import_group_id);
