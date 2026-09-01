import { useCallback, useState } from 'react';
import { CanonicalFormula } from '../types/formula.types';
import { computeNextReviewDate } from '../utils/formulaSpacedRepetition';

export function useFormulaRevision(formulas: CanonicalFormula[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const currentFormula = formulas[currentIndex] || null;
  const isFinished = currentIndex >= formulas.length;

  const reveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const rateQuality = useCallback(
    (rating: 'know' | 'review_again') => {
      // In production, persists spaced repetition state to SQLite
      computeNextReviewDate(0, rating);
      setCompletedCount((c) => c + 1);
      setIsRevealed(false);
      setCurrentIndex((idx) => idx + 1);
    },
    []
  );

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setIsRevealed(false);
    setCompletedCount(0);
  }, []);

  return {
    currentFormula,
    currentIndex,
    totalCount: formulas.length,
    isRevealed,
    isFinished,
    completedCount,
    reveal,
    rateQuality,
    restart,
  };
}
