import { useState, useCallback, useRef, useEffect } from 'react';
import { persistReadingProgress } from '../data/progress.repository';
import { clampPage } from '../utils/pageNavigation';

export function useReaderProgress(
  bookId: string,
  initialPage: number = 1,
  initialTotalPages: number = 500
) {
  const [currentPage, setCurrentPage] = useState<number>(() => clampPage(initialPage, initialTotalPages));
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const percentage = totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;

  const updatePage = useCallback(
    (newPage: number) => {
      const clamped = clampPage(newPage, totalPages);
      setCurrentPage(clamped);

      // Debounce writing progress to SQLite and cloud to avoid thrashing during rapid swiping
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        persistReadingProgress(bookId, clamped, totalPages);
      }, 500);
    },
    [bookId, totalPages]
  );

  const setTotal = useCallback(
    (count: number) => {
      if (count > 0 && count !== totalPages) {
        setTotalPages(count);
        setCurrentPage((prev) => clampPage(prev, count));
      }
    },
    [totalPages]
  );

  // Best-effort flush on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      persistReadingProgress(bookId, currentPage, totalPages);
    };
  }, [bookId, currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    percentage,
    updatePage,
    setTotalPages: setTotal,
  };
}
