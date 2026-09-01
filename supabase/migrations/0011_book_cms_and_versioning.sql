-- Migration 0011: Book CMS, Versioning, Chapter Revisions, Quality Issues, and Audit History

-- 1. Extend books table with CMS metadata, status, access modes, and timestamps
alter table public.books
  add column if not exists status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','UNPUBLISHED','ARCHIVED')),
  add column if not exists access_mode text not null default 'ALL_AUTHENTICATED' check (access_mode in ('ALL_AUTHENTICATED','ENTITLEMENT_REQUIRED','PRIVATE_TEST','RESTRICTED_GROUP')),
  add column if not exists online_reading_allowed boolean not null default true,
  add column if not exists tags jsonb not null default '[]'::jsonb,
  add column if not exists academic_year text,
  add column if not exists description text,
  add column if not exists authors jsonb not null default '[]'::jsonb,
  add column if not exists first_published_at timestamptz,
  add column if not exists current_version_published_at timestamptz,
  add column if not exists featured boolean not null default false,
  add column if not exists sort_order int not null default 0,
  add column if not exists version_token int not null default 1;

-- 2. Extend book_versions table with granular status, edition labels, and artifact states
alter table public.book_versions
  add column if not exists status text not null default 'PROCESSING' check (status in ('PROCESSING','REVIEW_REQUIRED','READY','ACTIVE','INACTIVE','FAILED')),
  add column if not exists edition_label text,
  add column if not exists search_pack_id uuid references public.content_packs(id) on delete set null,
  add column if not exists search_status text not null default 'READY' check (search_status in ('READY','PROCESSING','FAILED','STALE','UNAVAILABLE')),
  add column if not exists hscp_status text not null default 'READY' check (hscp_status in ('READY','PROCESSING','FAILED','STALE','CORRUPTED')),
  add column if not exists chapter_map_revision int not null default 1,
  add column if not exists search_indexed_pages int not null default 0,
  add column if not exists search_schema_version text not null default '1.0.0';

-- 3. Chapter Map Revisions (Versioned non-destructive chapter mapping drafts)
create table if not exists public.book_chapter_revisions (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  book_version_id uuid not null references public.book_versions(id) on delete cascade,
  revision_number int not null,
  chapters jsonb not null default '[]'::jsonb,
  source text not null default 'AUTO_DETECTION',
  status text not null default 'ACTIVE' check (status in ('DRAFT','ACTIVE','SUPERSEDED','REJECTED')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique(book_version_id, revision_number)
);

alter table public.book_chapter_revisions enable row level security;

-- 4. Content Issues and Quality Reports table
create table if not exists public.content_issues (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  book_version_id uuid references public.book_versions(id) on delete cascade,
  page_number int,
  category text not null check (category in (
    'WRONG_CHAPTER','WRONG_PAGE','WRONG_COVER','WRONG_METADATA',
    'READER_ERROR','SEARCH_ERROR','FORMULA_LINK_ERROR','CQ_LINK_ERROR',
    'COPYRIGHT_ISSUE','OTHER'
  )),
  priority text not null default 'NORMAL' check (priority in ('CRITICAL','HIGH','NORMAL','LOW')),
  status text not null default 'OPEN' check (status in ('OPEN','INVESTIGATING','FIXED','REJECTED','DUPLICATE')),
  message text not null,
  reporter_email text,
  reporter_user_id uuid references auth.users(id),
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_issues enable row level security;

-- 5. Book Audit Log table (Structured, immutable timeline of sensitive actions)
create table if not exists public.book_audit_log (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  book_version_id uuid references public.book_versions(id) on delete set null,
  action text not null check (action in (
    'BOOK_CREATED','METADATA_CHANGED','COVER_CHANGED','CHAPTER_MAP_CHANGED',
    'RIGHTS_CHANGED','VERSION_UPLOADED','VERSION_PUBLISHED','VERSION_ROLLBACK',
    'UNPUBLISH','ARCHIVE','SEARCH_REBUILT','HSCP_REBUILT','RELATIONSHIPS_CHANGED'
  )),
  actor_email text not null default 'admin@hscstudy.internal',
  actor_id uuid references auth.users(id),
  before_state jsonb not null default '{}'::jsonb,
  after_state jsonb not null default '{}'::jsonb,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.book_audit_log enable row level security;

-- 6. Book Relationships (Version-aware formula, CQ, and concept links)
create table if not exists public.book_relationships (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  book_version_id uuid not null references public.book_versions(id) on delete cascade,
  entity_type text not null check (entity_type in ('formula','cq','mcq','concept')),
  entity_id text not null,
  page_number int not null,
  chapter_number int,
  relationship_type text not null default 'DIRECT_REFERENCE' check (relationship_type in ('DIRECT_REFERENCE','EXAMPLE','EXERCISE','THEORY')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','NEEDS_REVIEW','BROKEN')),
  created_at timestamptz not null default now(),
  unique(book_version_id, entity_type, entity_id, page_number)
);

alter table public.book_relationships enable row level security;

-- 7. Performance indexes for CMS querying
create index if not exists idx_books_status_subject on public.books(status, subject_id, paper);
create index if not exists idx_books_search_lookup on public.books(title, publisher, edition);
create index if not exists idx_book_versions_status on public.book_versions(book_id, is_active, status);
create index if not exists idx_content_issues_lookup on public.content_issues(book_id, status, priority);
create index if not exists idx_book_audit_timeline on public.book_audit_log(book_id, created_at desc);
create index if not exists idx_book_relationships_lookup on public.book_relationships(book_version_id, page_number);
