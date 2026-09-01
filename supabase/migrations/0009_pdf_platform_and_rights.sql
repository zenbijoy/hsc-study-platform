-- Migration 0009: PDF Platform, Rights Management & Content Verification

alter table public.books
  add column if not exists rights_status text not null default 'UNVERIFIED' check (rights_status in ('OWNED','LICENSED','OPEN_LICENSE','PUBLIC_DOMAIN','PUBLISHER_AUTHORIZED','INTERNAL_ONLY','UNVERIFIED')),
  add column if not exists rights_source text,
  add column if not exists distribution_allowed boolean not null default false,
  add column if not exists offline_download_allowed boolean not null default false,
  add column if not exists license_name text,
  add column if not exists permission_document_ref text,
  add column if not exists cover_thumbnail_url text,
  add column if not exists cover_medium_url text;

alter table public.book_versions
  add column if not exists search_pack_id uuid references public.content_packs(id) on delete set null,
  add column if not exists text_ratio numeric(4,3) default 0.0,
  add column if not exists is_scanned boolean default false;

-- Create rights audit table
create table if not exists public.book_rights_audit (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  actor_id uuid references auth.users(id),
  previous_status text,
  new_status text not null,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.book_rights_audit enable row level security;

-- Performance index for student book browsing
create index if not exists idx_books_published_rights
  on public.books(is_published, distribution_allowed, subject_id);

create index if not exists idx_book_versions_search_pack
  on public.book_versions(search_pack_id);
