import { books as demoBooks } from '@/data/demo';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase/client';
import { createAppError } from '@/src/types/error.types';
import type { Book } from '@/src/types/book.types';

export async function getBooks(): Promise<Book[]> {
  if (!isSupabaseConfigured) {
    return demoBooks;
  }

  try {
    const { data, error } = await supabase
      .from('books')
      .select('*, book_versions!books_published_version_id_fkey(*)')
      .eq('is_published', true);

    if (error) {
      throw createAppError('SERVER', error.message, 'Unable to load book library.', error);
    }

    if (!data?.length) {
      return demoBooks;
    }

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
  } catch (err: any) {
    console.warn('[BooksRepository] Fallback to demo books:', err?.message);
    return demoBooks;
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  const all = await getBooks();
  return all.find((b) => b.id === id) ?? null;
}
