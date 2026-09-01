import { useCallback, useState } from 'react';
import {
  LibraryFilters,
  LibrarySortOption,
  LibraryViewMode,
} from '../types/library.types';
import { countActiveFilters, INITIAL_LIBRARY_FILTERS } from '../utils/libraryFilters';

export function useLibraryFilters(initialContext?: {
  subjectId?: string;
  paperNumber?: number;
  downloadedOnly?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<LibraryViewMode>('grid');
  const [sortOption, setSortOption] = useState<LibrarySortOption>('recommended');

  const [filters, setFilters] = useState<LibraryFilters>(() => {
    return {
      ...INITIAL_LIBRARY_FILTERS,
      subjectIds: initialContext?.subjectId ? [initialContext.subjectId] : [],
      paperNumbers: initialContext?.paperNumber ? [initialContext.paperNumber] : [],
      downloadedOnly: initialContext?.downloadedOnly || false,
    };
  });

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  const activeFilterCount = countActiveFilters(filters);
  const isFiltered = activeFilterCount > 0 || searchQuery.trim().length > 0;

  const setSubjectFilter = useCallback((subjectId: string) => {
    setFilters((prev) => {
      const exists = prev.subjectIds.includes(subjectId);
      return {
        ...prev,
        subjectIds: exists ? prev.subjectIds.filter((id) => id !== subjectId) : [...prev.subjectIds, subjectId],
      };
    });
  }, []);

  const toggleDownloadedOnly = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      downloadedOnly: !prev.downloadedOnly,
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setFilters(INITIAL_LIBRARY_FILTERS);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    sortOption,
    setSortOption,
    filters,
    setFilters,
    setSubjectFilter,
    toggleDownloadedOnly,
    clearAllFilters,
    activeFilterCount,
    isFiltered,
    isFilterSheetOpen,
    setIsFilterSheetOpen,
    isSortSheetOpen,
    setIsSortSheetOpen,
  };
}
