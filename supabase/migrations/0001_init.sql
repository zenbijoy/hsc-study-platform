-- HSC Study Platform core schema
-- Run in a fresh Supabase project.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  hsc_year int,
  board text,
  student_group text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  public_key_b64 text not null,
  install_label text,
  platform text,
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique(user_id, public_key_b64)
);

create table public.subjects (
  id text primary key,
  name_en text not null,
  name_bn text not null,
  icon text,
  accent text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.syllabus_chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null references public.subjects(id) on delete cascade,
  paper smallint,
  canonical_code text not null unique,
  title_en text,
  title_bn text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  subject_id text references public.subjects(id),
  title text not null,
  subtitle text,
  publisher text,
  edition text,
  paper smallint,
  access_mode text not null default 'free' check (access_mode in ('free','entitled','private')),
  is_protected boolean not null default true,
  is_published boolean not null default false,
  chapter_count int not null default 0,
  formula_count int not null default 0,
  cover_url text,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.book_versions (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  version int not null,
  page_count int not null default 0,
  package_sha256 text,
  storage_provider text not null default 'drive',
  original_object_id text,
  secure_object_id text,
  delivery_url text,
  original_metadata jsonb not null default '{}'::jsonb,
  secure_metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(book_id, version)
);

alter table public.books
  add column published_version_id uuid,
  add constraint books_published_version_id_fkey foreign key (published_version_id) references public.book_versions(id) on delete set null;

-- Sensitive wrapped content keys live separately. No client RLS policy is created.
create table public.book_secrets (
  book_version_id uuid primary key references public.book_versions(id) on delete cascade,
  key_version int not null,
  nonce_b64 text not null,
  ciphertext_b64 text not null,
  created_at timestamptz not null default now()
);

create table public.book_chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  book_version_id uuid not null references public.book_versions(id) on delete cascade,
  syllabus_chapter_id uuid references public.syllabus_chapters(id),
  chapter_number int not null,
  title text not null,
  start_page int not null,
  end_page int,
  confidence numeric(4,3) not null default 1.0,
  detection_source text,
  sort_order int not null default 0,
  unique(book_version_id, chapter_number)
);

create table public.content_packs (
  id uuid primary key default gen_random_uuid(),
  subject_id text references public.subjects(id),
  syllabus_chapter_id uuid references public.syllabus_chapters(id),
  pack_type text not null check (pack_type in ('formula','cq','mcq','note','definition','flashcard','search','mixed')),
  version int not null default 1,
  storage_provider text not null default 'drive',
  object_id text not null,
  delivery_url text,
  item_count bigint not null default 0,
  byte_size bigint not null default 0,
  sha256 text not null,
  codec text,
  encrypted boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Formula catalog contains only small/high-value formula records used for instant UI.
-- Very large bulk datasets remain content packs.
create table public.formula_catalog (
  id uuid primary key default gen_random_uuid(),
  subject_id text references public.subjects(id),
  syllabus_chapter_id uuid references public.syllabus_chapters(id),
  chapter_label text,
  title text not null,
  latex text not null,
  plain_text text,
  importance smallint not null default 3 check (importance between 1 and 5),
  usage_count int not null default 0,
  source_pack_id uuid references public.content_packs(id) on delete set null,
  import_id text,
  fingerprint text unique,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  source text not null default 'free',
  unique(user_id, book_id)
);

create table public.reading_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  page_number int not null default 1,
  percentage numeric(6,3) not null default 0,
  last_read_at timestamptz not null default now(),
  primary key(user_id, book_id)
);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  page_number int not null,
  title text,
  note text,
  created_at timestamptz not null default now()
);

create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.home_sections (
  id uuid primary key default gen_random_uuid(),
  section_type text not null,
  sort_order int not null default 0,
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb
);

create table public.import_audit (
  id uuid primary key default gen_random_uuid(),
  import_id text,
  source_name text,
  source_hash text,
  status text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.content_pack_audit (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index book_versions_book_idx on public.book_versions(book_id, version desc);
create index book_chapters_book_idx on public.book_chapters(book_id, sort_order);
create index packs_subject_idx on public.content_packs(subject_id, pack_type, is_published);
create index progress_user_idx on public.reading_progress(user_id, last_read_at desc);
create index bookmarks_user_idx on public.bookmarks(user_id, created_at desc);
create index entitlements_user_idx on public.entitlements(user_id, book_id);

alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.subjects enable row level security;
alter table public.syllabus_chapters enable row level security;
alter table public.books enable row level security;
alter table public.book_versions enable row level security;
alter table public.book_secrets enable row level security;
alter table public.book_chapters enable row level security;
alter table public.content_packs enable row level security;
alter table public.formula_catalog enable row level security;
alter table public.entitlements enable row level security;
alter table public.reading_progress enable row level security;
alter table public.bookmarks enable row level security;
alter table public.feature_flags enable row level security;
alter table public.home_sections enable row level security;
alter table public.import_audit enable row level security;
alter table public.content_pack_audit enable row level security;

create policy "profile owner read" on public.profiles for select using (auth.uid() = id);
create policy "profile owner insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profile owner update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "device owner read" on public.devices for select using (auth.uid() = user_id);
create policy "device owner insert" on public.devices for insert with check (auth.uid() = user_id);
create policy "device owner update" on public.devices for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "subjects readable" on public.subjects for select using (is_active = true);
create policy "syllabus readable" on public.syllabus_chapters for select using (true);
create policy "published books readable" on public.books for select using (is_published = true);
create policy "active published book versions readable" on public.book_versions for select using (
  is_active = true and exists(select 1 from public.books b where b.id = book_id and b.is_published = true)
);
create policy "published book chapters readable" on public.book_chapters for select using (
  exists(select 1 from public.books b where b.id = book_id and b.is_published = true)
);
create policy "published packs readable" on public.content_packs for select using (is_published = true);
create policy "published formulas readable" on public.formula_catalog for select using (is_published = true);
create policy "feature flags readable" on public.feature_flags for select using (true);
create policy "home sections readable" on public.home_sections for select using (enabled = true);

create policy "entitlement owner read" on public.entitlements for select using (auth.uid() = user_id);
create policy "progress owner all" on public.reading_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "bookmark owner all" on public.bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- No client policies for book_secrets/import audit tables. Service role bypasses RLS.

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger books_touch before update on public.books for each row execute function public.touch_updated_at();

-- Automatically create profile row on signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name) values(new.id, coalesce(new.raw_user_meta_data->>'full_name','')) on conflict do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
