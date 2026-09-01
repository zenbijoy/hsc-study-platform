-- Formula Hub & Knowledge Graph Performance Indexes

create index if not exists idx_formula_catalog_subject_chapter_importance 
  on public.formula_catalog(subject_id, syllabus_chapter_id, importance desc)
  where is_published = true;

create index if not exists idx_formula_catalog_published_importance 
  on public.formula_catalog(importance desc)
  where is_published = true;

create index if not exists idx_content_packs_subject_type 
  on public.content_packs(subject_id, pack_type, is_published);
