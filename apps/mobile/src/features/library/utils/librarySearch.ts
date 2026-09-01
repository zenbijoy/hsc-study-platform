import { LibraryBookViewModel } from '../types/library.types';

export function normalizeSearchTerm(term: string): string {
  if (!term) return '';
  return term
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function matchesBookSearch(
  book: LibraryBookViewModel,
  normalizedQuery: string
): boolean {
  if (!normalizedQuery) return true;

  const target = `${book.title} ${book.subtitle || ''} ${book.subjectName} ${book.publisher || ''} ${book.edition || ''}`.toLowerCase();

  const words = normalizedQuery.split(' ');
  return words.every((word) => target.includes(word));
}
