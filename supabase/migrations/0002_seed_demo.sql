insert into public.subjects(id,name_en,name_bn,icon,accent,sort_order) values
('physics','Physics','পদার্থবিজ্ঞান','atom-outline','#6CB7FF',1),
('chemistry','Chemistry','রসায়ন','flask-outline','#57E0B7',2),
('math','Higher Math','উচ্চতর গণিত','calculator-outline','#A58BFF',3),
('biology','Biology','জীববিজ্ঞান','leaf-outline','#FF8A76',4)
on conflict(id) do update set name_en=excluded.name_en,name_bn=excluded.name_bn,icon=excluded.icon,accent=excluded.accent;

insert into public.syllabus_chapters(subject_id,paper,canonical_code,title_en,title_bn,sort_order) values
('physics',1,'physics.p1.motion','Motion','গতিবিদ্যা',1),
('physics',1,'physics.p1.newtonian','Newtonian Mechanics','নিউটনীয় বলবিদ্যা',2),
('physics',1,'physics.p1.work_energy','Work and Energy','কাজ ও শক্তি',3)
on conflict(canonical_code) do nothing;

insert into public.formula_catalog(subject_id,chapter_label,title,latex,plain_text,importance,usage_count,is_published) values
('physics','Motion','First equation of motion','v=u+at','v = u + at',5,27,true),
('physics','Motion','Second equation of motion','s=ut+\\frac{1}{2}at^2','s = ut + ½at²',5,41,true),
('physics','Newtonian Mechanics','Newton''s second law','F=ma','F = ma',5,62,true),
('physics','Work and Energy','Kinetic energy','E_k=\\frac{1}{2}mv^2','Eₖ = ½mv²',4,33,true);

insert into public.feature_flags(key,enabled,config) values
('smart_dark',true,'{}'),
('offline_reader',true,'{"licenseHours":168}'),
('semantic_search',false,'{}'),
('ai_explanation',false,'{}')
on conflict(key) do update set enabled=excluded.enabled,config=excluded.config;

insert into public.home_sections(section_type,sort_order,enabled,config) values
('continue_reading',1,true,'{}'),
('subject_grid',2,true,'{}'),
('formula_of_day',3,true,'{}'),
('recent_books',4,true,'{}');
