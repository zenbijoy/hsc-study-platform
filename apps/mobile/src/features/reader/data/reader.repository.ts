import { fetchBookDetailsData } from '@/src/features/books/data/bookDetails.repository';
import { bengaliChaptersFixture } from '@/src/fixtures/bengaliFixtures';
import type { Chapter } from '@/src/types/book.types';

export async function fetchReaderBookData(bookId: string) {
  try {
    const details = await fetchBookDetailsData(bookId);
    return details;
  } catch {
    return null;
  }
}

export function getFallbackReaderChapters(bookId: string): Chapter[] {
  return bengaliChaptersFixture.map((ch) => ({
    ...ch,
    bookId,
  })) as Chapter[];
}
