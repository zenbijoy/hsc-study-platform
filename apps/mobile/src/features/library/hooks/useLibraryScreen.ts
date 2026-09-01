import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/providers/AuthProvider';
import { getPreferredSubjectIds } from '@/src/features/onboarding/selectors/personalization';
import { fetchLibraryBooks } from '../data/library.repository';
import { useLibraryFilters } from './useLibraryFilters';
import { matchesLibraryFilters } from '../utils/libraryFilters';
import { matchesBookSearch, normalizeSearchTerm } from '../utils/librarySearch';
import { sortLibraryBooks } from '../utils/librarySorting';
import { LibraryBookViewModel, LibraryScreenViewModel } from '../types/library.types';

export function useLibraryScreen(initialContext?: {
  subjectId?: string;
  paperNumber?: number;
  downloadedOnly?: boolean;
}) {
  const { profile } = useAuth();
  const preferredSubjectIds = useMemo(() => getPreferredSubjectIds(profile), [profile]);
  const [refreshing, setRefreshing] = useState(false);

  const filterState = useLibraryFilters(initialContext);

  // 1. Fetch Library Books (Local SQLite First, then Remote)
  const { data: allBooks = [], refetch, isLoading } = useQuery({
    queryKey: ['library', 'books'],
    queryFn: () => fetchLibraryBooks(),
    staleTime: 1000 * 60 * 15,
  });

  // 2. Filter & Search
  const normalizedQuery = normalizeSearchTerm(filterState.searchQuery);

  const filteredBooks = useMemo(() => {
    return allBooks.filter((book) => {
      const matchFilter = matchesLibraryFilters(book, filterState.filters);
      const matchSearch = matchesBookSearch(book, normalizedQuery);
      return matchFilter && matchSearch;
    });
  }, [allBooks, filterState.filters, normalizedQuery]);

  // 3. Sort
  const sortedBooks = useMemo(() => {
    return sortLibraryBooks(
      filteredBooks,
      filterState.sortOption,
      preferredSubjectIds,
      initialContext?.subjectId
    );
  }, [filteredBooks, filterState.sortOption, preferredSubjectIds, initialContext?.subjectId]);

  // 4. Counts & Publishers
  const downloadedCount = useMemo(
    () => allBooks.filter((b) => b.isDownloaded).length,
    [allBooks]
  );

  const availablePublishers = useMemo(() => {
    const set = new Set<string>();
    allBooks.forEach((b) => {
      if (b.publisher) set.add(b.publisher);
    });
    return Array.from(set);
  }, [allBooks]);

  const viewModel: LibraryScreenViewModel = {
    books: sortedBooks,
    totalCount: sortedBooks.length,
    downloadedCount,
    activeFilterCount: filterState.activeFilterCount,
    isFiltered: filterState.isFiltered,
    availablePublishers,
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return {
    viewModel,
    isLoading,
    refreshing,
    onRefresh,
    ...filterState,
  };
}
