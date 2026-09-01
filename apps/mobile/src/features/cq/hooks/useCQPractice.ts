import { useCallback, useState } from 'react';
import { CanonicalCQ } from '../types/cq.types';

export function useCQPractice(questions: CanonicalCQ[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [ratings, setRatings] = useState<Record<string, 'got_it' | 'need_review'>>({});

  const currentQuestion = questions[currentIndex] || null;
  const isFinished = currentIndex >= questions.length;

  const toggleRevealSolution = useCallback((cqId: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [cqId]: !prev[cqId],
    }));
  }, []);

  const rateQuestion = useCallback(
    (rating: 'got_it' | 'need_review') => {
      if (!currentQuestion) return;
      setRatings((prev) => ({
        ...prev,
        [currentQuestion.id]: rating,
      }));
      setCurrentIndex((idx) => idx + 1);
    },
    [currentQuestion]
  );

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setRevealedSolutions({});
    setRatings({});
  }, []);

  return {
    currentQuestion,
    currentIndex,
    totalCount: questions.length,
    isSolutionRevealed: currentQuestion ? Boolean(revealedSolutions[currentQuestion.id]) : false,
    toggleRevealSolution: () => currentQuestion && toggleRevealSolution(currentQuestion.id),
    rateQuestion,
    ratings,
    isFinished,
    restart,
  };
}
