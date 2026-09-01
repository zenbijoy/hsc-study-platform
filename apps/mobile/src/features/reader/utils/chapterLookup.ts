import type { Chapter } from '@/src/types/book.types';
import type { ReaderChapterItem } from '../types/reader.types';

/**
 * Classifies section type based on title keywords.
 */
export function classifySectionType(title: string): ReaderChapterItem['sectionType'] {
  const lower = title.toLowerCase();
  if (lower.includes('preface') || lower.includes('ভূমিকা') || lower.includes('মুখবন্ধ')) {
    return 'preface';
  }
  if (lower.includes('contents') || lower.includes('সূচিপত্র') || lower.includes('তালিকা')) {
    return 'toc';
  }
  if (lower.includes('appendix') || lower.includes('পরিশিষ্ট') || lower.includes('সংযোজনী')) {
    return 'appendix';
  }
  if (lower.includes('index') || lower.includes('নির্ঘণ্ট')) {
    return 'index';
  }
  return 'chapter';
}

/**
 * Finds the current active chapter given the current page number using sorted binary-style range lookup.
 */
export function findCurrentChapter(
  chapters: Chapter[],
  currentPage: number
): Chapter | null {
  if (!chapters || chapters.length === 0) return null;

  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    if (!ch) continue;
    const nextCh = chapters[i + 1];
    const endPage = ch.endPage ?? (nextCh ? nextCh.startPage - 1 : ch.startPage + 50);

    if (currentPage >= ch.startPage && currentPage <= endPage) {
      return ch;
    }
  }

  const first = chapters[0];
  const last = chapters[chapters.length - 1];
  if (first && currentPage < first.startPage) return first;
  return last ?? null;
}

/**
 * Calculates per-chapter reading progress based on furthest read page or current page.
 */
export function calculateChapterProgress(
  chapter: Chapter,
  currentPage: number,
  nextChapter?: Chapter
): number {
  const start = chapter.startPage;
  const end = chapter.endPage ?? (nextChapter ? nextChapter.startPage - 1 : start + 30);
  const totalInChapter = Math.max(1, end - start + 1);

  if (currentPage < start) return 0;
  if (currentPage >= end) return 100;

  const readInChapter = currentPage - start + 1;
  return Math.min(100, Math.max(0, Math.round((readInChapter / totalInChapter) * 100)));
}
