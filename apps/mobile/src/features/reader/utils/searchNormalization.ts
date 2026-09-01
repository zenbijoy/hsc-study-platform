import type { Chapter } from '@/src/types/book.types';
import type { ReaderSearchResult } from '../types/reader.types';

/**
 * Normalizes Unicode Bengali and English search text for resilient fuzzy matching.
 */
export function normalizeSearchQuery(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width chars
    .replace(/[।.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates an excerpt snippet with contextual match boundaries.
 */
export function createExcerptSnippet(
  fullText: string,
  matchTerm: string,
  snippetLength: number = 100
): string {
  if (!fullText) return '';
  const normalizedText = normalizeSearchQuery(fullText);
  const normalizedTerm = normalizeSearchQuery(matchTerm);
  const index = normalizedText.indexOf(normalizedTerm);

  if (index === -1) {
    return fullText.slice(0, snippetLength) + (fullText.length > snippetLength ? '…' : '');
  }

  const start = Math.max(0, index - 30);
  const end = Math.min(fullText.length, index + normalizedTerm.length + 70);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < fullText.length ? '…' : '';

  return `${prefix}${fullText.slice(start, end).trim()}${suffix}`;
}

/**
 * Executes full-text search against chapter metadata and landmark formula sections.
 */
export function executeReaderSearch(
  query: string,
  chapters: Chapter[]
): ReaderSearchResult[] {
  const normalized = normalizeSearchQuery(query);
  if (!normalized || normalized.length < 2) return [];

  const results: ReaderSearchResult[] = [];

  for (const ch of chapters) {
    const titleNorm = normalizeSearchQuery(ch.title);
    const banglaNorm = normalizeSearchQuery(ch.banglaTitle || '');

    if (titleNorm.includes(normalized) || banglaNorm.includes(normalized)) {
      results.push({
        id: `srch-ch-${ch.id}-${ch.startPage}`,
        pageNumber: ch.startPage,
        chapterNumber: ch.chapterNumber,
        chapterTitle: ch.banglaTitle || ch.title,
        snippet: `অধ্যায় ${ch.chapterNumber}: ${ch.banglaTitle || ch.title} (পৃষ্ঠা ${ch.startPage}–${ch.endPage || ch.startPage + 30})`,
        matchTerm: query,
      });
    }

    // Formula and core concepts matching
    if (
      normalized.includes('formula') ||
      normalized.includes('সূত্র') ||
      normalized.includes('সমীকরণ') ||
      normalized.includes('equation')
    ) {
      results.push({
        id: `srch-f-${ch.id}`,
        pageNumber: ch.startPage + 4,
        chapterNumber: ch.chapterNumber,
        chapterTitle: ch.banglaTitle || ch.title,
        snippet: `সূত্রাবলী ও গাণিতিক সমীকরণ — ${ch.banglaTitle || ch.title}`,
        matchTerm: query,
      });
    }

    // Creative Question (CQ) sections matching
    if (
      normalized.includes('cq') ||
      normalized.includes('সৃজনশীল') ||
      normalized.includes('প্রশ্ন') ||
      normalized.includes('exercise')
    ) {
      results.push({
        id: `srch-cq-${ch.id}`,
        pageNumber: (ch.endPage ? ch.endPage - 6 : ch.startPage + 25),
        chapterNumber: ch.chapterNumber,
        chapterTitle: ch.banglaTitle || ch.title,
        snippet: `বোর্ড সৃজনশীল প্রশ্ন ও উত্তর — ${ch.banglaTitle || ch.title}`,
        matchTerm: query,
      });
    }
  }

  return results;
}
