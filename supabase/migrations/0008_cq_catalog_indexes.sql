-- Creative Question (CQ) Performance Indexes & Content Pack Metadata

create index if not exists idx_content_packs_cq_lookup 
  on public.content_packs(subject_id, pack_type, is_published);

create index if not exists idx_study_sessions_type_user 
  on public.study_sessions(user_id, session_type, started_at desc);
