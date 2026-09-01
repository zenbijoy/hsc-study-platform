import {
  books as demoBooks,
  formulas as demoFormulas,
  subjects as demoSubjects,
  type Book,
  type Formula,
  type Subject,
} from '@/data/demo';
import { supabase, supabaseConfigured } from './supabase';

export async function getSubjects(): Promise<Subject[]> {
  if (!supabaseConfigured) return demoSubjects;
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error || !data?.length) return demoSubjects;
  return data.map((s: any) => ({
    id: s.id,
    name: s.name_en,
    banglaName: s.name_bn,
    icon: s.icon ?? 'book-outline',
    accent: s.accent ?? '#6CB7FF',
    bookCount: s.book_count ?? 0,
    progress: 0,
  }));
}

export async function getBooks(): Promise<Book[]> {
  if (!supabaseConfigured) return demoBooks;
  const { data, error } = await supabase
    .from('books')
    .select('*, book_versions!books_published_version_id_fkey(*)')
    .eq('is_published', true);
  if (error || !data?.length) return demoBooks;
  return data.map((b: any) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle ?? '',
    subjectId: b.subject_id ?? 'physics',
    publisher: b.publisher ?? 'HSC Publisher',
    pages: b.book_versions?.page_count ?? 0,
    chapters: b.chapter_count ?? 0,
    formulas: b.formula_count ?? 0,
    progress: 0,
    lastPage: 1,
    protected: b.is_protected ?? true,
    publishedVersionId: b.book_versions?.id,
  }));
}

export async function getFormulas(): Promise<Formula[]> {
  if (!supabaseConfigured) return demoFormulas;
  const { data, error } = await supabase
    .from('formula_catalog')
    .select('*')
    .order('importance', { ascending: false })
    .limit(200);
  if (error || !data?.length) return demoFormulas;
  return data.map((f: any) => ({
    id: f.id,
    subjectId: f.subject_id ?? 'physics',
    chapter: f.chapter_label ?? 'General',
    title: f.title,
    latex: f.latex,
    plain: f.plain_text ?? f.latex,
    importance: f.importance ?? 3,
    uses: f.usage_count ?? 0,
    explanation: f.explanation,
  }));
}
