import { LibraryBookViewModel, LibrarySortOption } from '../types/library.types';

export function computeBookRecommendationScore(
  book: LibraryBookViewModel,
  preferredSubjectIds: string[] = [],
  contextSubjectId?: string
): number {
  let score = 0;

  // 1. Explicit Navigation Context Match (+100)
  if (contextSubjectId && book.subjectId === contextSubjectId) {
    score += 100;
  }

  // 2. Student Preferred Subject (+40)
  if (preferredSubjectIds.includes(book.subjectId)) {
    score += 40;
  }

  // 3. Unfinished Book in Progress (+20)
  if (book.progress > 0 && book.progress < 100) {
    score += 20;
  }

  // 4. New Textbook Edition (+10)
  if (book.isNew) {
    score += 10;
  }

  // 5. Downloaded Offline Ready (+5)
  if (book.isDownloaded) {
    score += 5;
  }

  return score;
}

export function sortLibraryBooks(
  books: LibraryBookViewModel[],
  sortOption: LibrarySortOption,
  preferredSubjectIds: string[] = [],
  contextSubjectId?: string
): LibraryBookViewModel[] {
  const list = [...books];

  switch (sortOption) {
    case 'recommended':
      return list.sort((a, b) => {
        const scoreA = computeBookRecommendationScore(a, preferredSubjectIds, contextSubjectId);
        const scoreB = computeBookRecommendationScore(b, preferredSubjectIds, contextSubjectId);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.title.localeCompare(b.title);
      });

    case 'recently_added':
      return list.sort((a, b) => {
        if (a.publishedAt && b.publishedAt) {
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        }
        return b.id.localeCompare(a.id);
      });

    case 'title_asc':
      return list.sort((a, b) => a.title.localeCompare(b.title));

    case 'title_desc':
      return list.sort((a, b) => b.title.localeCompare(a.title));

    case 'progress':
    case 'recently_read':
      return list.sort((a, b) => (b.progress || 0) - (a.progress || 0));

    case 'downloaded_first':
      return list.sort((a, b) => {
        if (a.isDownloaded && !b.isDownloaded) return -1;
        if (!a.isDownloaded && b.isDownloaded) return 1;
        return a.title.localeCompare(b.title);
      });

    default:
      return list;
  }
}
