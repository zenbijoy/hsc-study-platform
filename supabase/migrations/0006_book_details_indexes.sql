-- Book Details & Chapter Index Performance Indexes

create index if not exists idx_book_chapters_book_version 
  on public.book_chapters(book_id, book_version_id, sort_order);

create index if not exists idx_book_versions_active 
  on public.book_versions(book_id, is_active) 
  where is_active = true;

create index if not exists idx_reading_progress_user_book 
  on public.reading_progress(user_id, book_id);
