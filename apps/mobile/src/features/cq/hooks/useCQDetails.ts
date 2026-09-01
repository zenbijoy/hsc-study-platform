import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStudyStore } from '@/store/studyStore';
import { fetchCQById } from '../data/cq.repository';

export function useCQDetails(cqId: string) {
  const [revealedParts, setRevealedParts] = useState<Record<string, boolean>>({});
  const savedItemIds = useStudyStore((state: any) => state.savedItemIds || []);
  const toggleSaveItem = useStudyStore((state: any) => state.toggleSaveItem || (() => {}));

  const { data: cq, isLoading } = useQuery({
    queryKey: ['cq', cqId],
    queryFn: () => fetchCQById(cqId),
    enabled: Boolean(cqId),
  });

  const isSaved = cq ? savedItemIds.includes(cq.id) : false;

  const toggleRevealPart = (partId: string) => {
    setRevealedParts((prev) => ({
      ...prev,
      [partId]: !prev[partId],
    }));
  };

  const revealAllAnswers = () => {
    if (!cq) return;
    const next: Record<string, boolean> = {};
    cq.subQuestions.forEach((p) => {
      next[p.id] = true;
    });
    setRevealedParts(next);
  };

  return {
    cq,
    isLoading,
    isSaved,
    toggleSave: () => cq && toggleSaveItem(cq.id),
    revealedParts,
    toggleRevealPart,
    revealAllAnswers,
  };
}
