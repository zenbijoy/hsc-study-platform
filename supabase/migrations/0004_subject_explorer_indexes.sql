-- Subject Explorer & Syllabus Performance Indexes

create index if not exists idx_syllabus_chapters_subject_paper 
  on public.syllabus_chapters(subject_id, paper, sort_order);

create index if not exists idx_book_chapters_syllabus_ref 
  on public.book_chapters(syllabus_chapter_id);

create index if not exists idx_content_packs_subject_type 
  on public.content_packs(subject_id, pack_type) 
  where is_published = true;

create index if not exists idx_formula_catalog_subject_chapter 
  on public.formula_catalog(subject_id, syllabus_chapter_id) 
  where is_published = true;
