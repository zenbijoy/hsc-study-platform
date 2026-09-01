import { getBooks } from '@/src/repositories/books.repository';
import { getSubjects } from '@/src/repositories/subjects.repository';
import { LibraryBookViewModel } from '../types/library.types';
import type { Book } from '@/src/types/book.types';

export async function fetchLibraryBooks(): Promise<LibraryBookViewModel[]> {
  const [books, subjects] = await Promise.all([getBooks(), getSubjects()]);

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  return (books as Book[]).map((book) => {
    const isDownloaded = book.id === 'phys-1st' || book.id === 'chem-1st';
    const hasUpdate = false;
    const isNew = book.id.includes('2026') || book.id.includes('new');

    return {
      id: book.id,
      title: book.title,
      subtitle: book.subtitle || undefined,
      subjectId: book.subjectId,
      subjectName: subjectMap.get(book.subjectId) || book.subjectId,
      paperNumber: book.title.includes('2nd') || book.title.includes('দ্বিতীয়') ? 2 : 1,
      publisher: book.publisher || 'NCTB Approved',
      edition: '2026 Edition',
      totalPages: book.pages || 540,
      chapters: book.chapters || 10,
      formulas: book.formulas || 42,
      progress: book.progress || 0,
      lastPage: book.lastPage || 1,
      accessStatus: 'available',
      isDownloaded,
      hasUpdate,
      isNew,
    };
  });
}
