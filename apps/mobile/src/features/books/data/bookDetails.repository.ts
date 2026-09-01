import { getBookById } from '@/src/repositories/books.repository';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase/client';
import { bengaliChaptersFixture, bengaliFormulasFixture } from '@/src/fixtures/bengaliFixtures';
import { BookDetailsChapter } from '../types/bookDetails.types';
import type { Book, BookVersion, Chapter } from '@/src/types/book.types';
import type { Formula } from '@/src/types/formula.types';

export async function fetchBookDetailsData(bookId: string): Promise<{
  book: Book | null;
  activeVersion: BookVersion | null;
  chapters: BookDetailsChapter[];
  formulas: Formula[];
}> {
  const book = await getBookById(bookId);
  if (!book) {
    return { book: null, activeVersion: null, chapters: [], formulas: [] };
  }

  const activeVersion: BookVersion = {
    id: book.publishedVersionId || `ver-${book.id}-v1`,
    bookId: book.id,
    version: 1,
    pageCount: book.pages || 540,
    storageProvider: 'drive',
    isActive: true,
  };

  let chapters: BookDetailsChapter[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('book_chapters')
        .select('*')
        .eq('book_id', book.id)
        .order('chapter_number');

      if (!error && data && data.length > 0) {
        chapters = data.map((ch: any) => ({
          id: ch.id,
          syllabusChapterId: ch.syllabus_chapter_id,
          chapterNumber: ch.chapter_number,
          title: ch.title,
          banglaTitle: ch.title,
          startPage: ch.start_page,
          endPage: ch.end_page || ch.start_page + 30,
          formulaCount: 20,
          cqCount: 30,
          mcqCount: 120,
          progress: 0,
          isDownloaded: true,
        }));
      }
    } catch {
      // Fallback
    }
  }

  if (chapters.length === 0) {
    chapters = (bengaliChaptersFixture as Chapter[]).map((ch) => ({
      id: ch.id,
      chapterNumber: ch.chapterNumber,
      title: ch.title,
      banglaTitle: ch.banglaTitle,
      startPage: ch.startPage,
      endPage: ch.endPage,
      formulaCount: ch.formulaCount,
      cqCount: ch.cqCount,
      mcqCount: ch.mcqCount,
      progress: ch.chapterNumber === 4 ? 62 : ch.chapterNumber === 1 ? 100 : 0,
      isDownloaded: ch.chapterNumber <= 2,
    }));
  }

  const formulas = bengaliFormulasFixture.filter((f) => f.subjectId === book.subjectId).slice(0, 3);

  return {
    book,
    activeVersion,
    chapters,
    formulas,
  };
}
