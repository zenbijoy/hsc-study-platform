import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStudyStore } from '@/store/studyStore';
import { fetchCQCatalog } from '../data/cq.repository';
import { matchesCQSearch, normalizeCQQuery } from '../utils/cqSearch';

export function useCQHub(initialSubject?: string) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || 'all');
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const [officialOnly, setOfficialOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Saved store from studyStore
  const savedItemIds = useStudyStore((state: any) => state.savedItemIds || []);
  const toggleSaveItem = useStudyStore((state: any) => state.toggleSaveItem || (() => {}));

  const { data: allCQs = [], refetch, isLoading } = useQuery({
    queryKey: ['cqs', 'catalog'],
    queryFn: fetchCQCatalog,
    staleTime: 1000 * 60 * 30,
  });

  const normalizedQuery = normalizeCQQuery(searchQuery);

  const filteredCQs = useMemo(() => {
    return allCQs.filter((cq) => {
      // Subject filter
      if (selectedSubject !== 'all' && cq.subjectId !== selectedSubject) {
        return false;
      }
      // Board filter
      if (selectedBoard !== 'all' && cq.board !== selectedBoard) {
        return false;
      }
      // Official filter
      if (officialOnly && !cq.isOfficialBoard) {
        return false;
      }
      // Saved filter
      if (savedOnly && !savedItemIds.includes(cq.id)) {
        return false;
      }
      // Search
      return matchesCQSearch(cq, normalizedQuery);
    });
  }, [allCQs, selectedSubject, selectedBoard, officialOnly, savedOnly, savedItemIds, normalizedQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return {
    cqs: filteredCQs,
    totalCount: filteredCQs.length,
    isLoading,
    refreshing,
    onRefresh,
    searchQuery,
    setSearchQuery,
    selectedSubject,
    setSelectedSubject,
    selectedBoard,
    setSelectedBoard,
    savedOnly,
    setSavedOnly,
    officialOnly,
    setOfficialOnly,
    savedItemIds,
    toggleSaveItem,
  };
}
