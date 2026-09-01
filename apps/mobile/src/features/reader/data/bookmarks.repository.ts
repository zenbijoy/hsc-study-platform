import type { ReaderBookmark } from '../types/reader.types';

// In-memory / SQLite-backed bookmarks cache
const inMemoryBookmarks = new Map<string, ReaderBookmark[]>();

export function getBookmarksForBook(bookId: string): ReaderBookmark[] {
  return inMemoryBookmarks.get(bookId) || [];
}

export function saveBookmarkForBook(bookmark: ReaderBookmark): ReaderBookmark[] {
  const list = getBookmarksForBook(bookmark.bookId);
  const exists = list.some((b) => b.pageNumber === bookmark.pageNumber);
  let updated: ReaderBookmark[];

  if (exists) {
    updated = list.filter((b) => b.pageNumber !== bookmark.pageNumber);
  } else {
    updated = [...list, bookmark].sort((a, b) => a.pageNumber - b.pageNumber);
  }

  inMemoryBookmarks.set(bookmark.bookId, updated);
  return updated;
}

export function deleteBookmarkById(bookId: string, bookmarkId: string): ReaderBookmark[] {
  const list = getBookmarksForBook(bookId);
  const updated = list.filter((b) => b.id !== bookmarkId);
  inMemoryBookmarks.set(bookId, updated);
  return updated;
}
