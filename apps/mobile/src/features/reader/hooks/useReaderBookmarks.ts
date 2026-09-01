import { useState, useCallback, useMemo } from 'react';
import { getBookmarksForBook, saveBookmarkForBook, deleteBookmarkById } from '../data/bookmarks.repository';
import type { ReaderBookmark } from '../types/reader.types';

export function useReaderBookmarks(bookId: string, versionId?: string) {
  const [bookmarks, setBookmarks] = useState<ReaderBookmark[]>(() => getBookmarksForBook(bookId));

  const isPageBookmarked = useCallback(
    (pageNumber: number) => {
      return bookmarks.some((b) => b.pageNumber === pageNumber);
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    (pageNumber: number, chapterTitle?: string, chapterId?: string) => {
      const existing = bookmarks.find((b) => b.pageNumber === pageNumber);
      if (existing) {
        const updated = deleteBookmarkById(bookId, existing.id);
        setBookmarks(updated);
        return false;
      } else {
        const newBookmark: ReaderBookmark = {
          id: `bm-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
          bookId,
          versionId,
          pageNumber,
          chapterId,
          chapterTitle: chapterTitle || `Page ${pageNumber}`,
          title: `Bookmark • Page ${pageNumber}`,
          createdAt: Date.now(),
        };
        const updated = saveBookmarkForBook(newBookmark);
        setBookmarks(updated);
        return true;
      }
    },
    [bookId, versionId, bookmarks]
  );

  const removeBookmark = useCallback(
    (id: string) => {
      const updated = deleteBookmarkById(bookId, id);
      setBookmarks(updated);
    },
    [bookId]
  );

  return {
    bookmarks,
    isPageBookmarked,
    toggleBookmark,
    removeBookmark,
  };
}
