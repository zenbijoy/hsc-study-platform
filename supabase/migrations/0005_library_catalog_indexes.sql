-- Library Catalog Performance Indexes

create index if not exists idx_books_published_subject_paper 
  on public.books(subject_id, paper, created_at desc) 
  where is_published = true;

create index if not exists idx_books_published_created 
  on public.books(created_at desc) 
  where is_published = true;

create index if not exists idx_books_published_publisher 
  on public.books(publisher) 
  where is_published = true;
