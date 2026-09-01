import { useState, useCallback, useEffect, useRef } from 'react';
import type { Chapter } from '@/src/types/book.types';
import type { ReaderSearchResult } from '../types/reader.types';
import { executeReaderSearch } from '../utils/searchNormalization';

export function useReaderSearch(chapters: Chapter[], debounceMs: number = 250) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ReaderSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    timeoutRef.current = setTimeout(() => {
      const matches = executeReaderSearch(query, chapters);
      setResults(matches);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, chapters, debounceMs]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    clearSearch,
  };
}
