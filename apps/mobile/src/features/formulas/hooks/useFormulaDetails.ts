import { useQuery } from '@tanstack/react-query';
import { useStudyStore } from '@/store/studyStore';
import { fetchFormulaById } from '../data/formulas.repository';

export function useFormulaDetails(formulaId: string) {
  const favoriteFormulaIds = useStudyStore((state: any) => state.favoriteFormulaIds || []);
  const toggleFavoriteFormula = useStudyStore((state: any) => state.toggleFavoriteFormula);

  const { data: formula, isLoading } = useQuery({
    queryKey: ['formula', formulaId],
    queryFn: () => fetchFormulaById(formulaId),
    enabled: Boolean(formulaId),
  });

  const isSaved = formula ? favoriteFormulaIds.includes(formula.id) : false;

  return {
    formula,
    isLoading,
    isSaved,
    toggleSave: () => formula && toggleFavoriteFormula(formula.id),
  };
}
