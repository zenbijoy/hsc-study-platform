import { ReaderSearchResult } from '../types/reader.types';
import type { Chapter } from '@/src/types/book.types';

export function searchInsideBook(
  query: string,
  chapters: Chapter[]
): ReaderSearchResult[] {
  if (!query || query.trim().length < 2) return [];

  const normalized = query.trim().toLowerCase();
  const results: ReaderSearchResult[] = [];

  chapters.forEach((ch) => {
    const titleMatch = ch.title.toLowerCase().includes(normalized);
    const banglaMatch = ch.banglaTitle?.toLowerCase().includes(normalized);

    if (titleMatch || banglaMatch) {
      results.push({
        id: `search-${ch.id}-${ch.startPage}`,
        pageNumber: ch.startPage,
        chapterNumber: ch.chapterNumber,
        chapterTitle: ch.title,
        snippet: `Chapter ${ch.chapterNumber}: ${ch.title} (Pages ${ch.startPage}–${ch.endPage})`,
        matchTerm: query,
      });
    }

    // Add intermediate landmark search points for formulas / exercises
    if (normalized.includes('formula') || normalized.includes('সূত্র')) {
      results.push({
        id: `search-formula-${ch.id}`,
        pageNumber: ch.startPage + 5,
        chapterNumber: ch.chapterNumber,
        chapterTitle: ch.title,
        snippet: `Formula Sheet & Equations — ${ch.title}`,
        matchTerm: query,
      });
    }
  });

  return results;
}
