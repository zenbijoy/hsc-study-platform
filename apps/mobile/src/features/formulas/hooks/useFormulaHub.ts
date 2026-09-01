import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStudyStore } from '@/store/studyStore';
import { fetchFormulaCatalog } from '../data/formulas.repository';
import { matchesFormulaSearch, normalizeFormulaQuery } from '../utils/formulaSearch';
import { CanonicalFormula, FormulaFilters } from '../types/formula.types';

export function useFormulaHub(initialSubject?: string) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || 'all');
  const [savedOnly, setSavedOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Favorites store
  const favoriteFormulaIds = useStudyStore((state: any) => state.favoriteFormulaIds || []);
  const toggleFavoriteFormula = useStudyStore((state: any) => state.toggleFavoriteFormula);

  const { data: allFormulas = [], refetch, isLoading } = useQuery({
    queryKey: ['formulas', 'catalog'],
    queryFn: fetchFormulaCatalog,
    staleTime: 1000 * 60 * 30,
  });

  const normalizedQuery = normalizeFormulaQuery(searchQuery);

  const filteredFormulas = useMemo(() => {
    return allFormulas.filter((formula) => {
      // Subject filter
      if (selectedSubject !== 'all' && formula.subjectId !== selectedSubject) {
        return false;
      }
      // Saved filter
      if (savedOnly && !favoriteFormulaIds.includes(formula.id)) {
        return false;
      }
      // Search
      return matchesFormulaSearch(formula, normalizedQuery);
    });
  }, [allFormulas, selectedSubject, savedOnly, favoriteFormulaIds, normalizedQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return {
    formulas: filteredFormulas,
    totalCount: filteredFormulas.length,
    isLoading,
    refreshing,
    onRefresh,
    searchQuery,
    setSearchQuery,
    selectedSubject,
    setSelectedSubject,
    savedOnly,
    setSavedOnly,
    favoriteFormulaIds,
    toggleFavoriteFormula,
  };
}
