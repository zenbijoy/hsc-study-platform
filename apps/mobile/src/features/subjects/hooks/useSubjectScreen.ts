import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/providers/AuthProvider';
import { getSubjects } from '@/src/repositories/subjects.repository';
import {
  computeSubjectStats,
  getChaptersByPaper,
  getContinueSubjectStudyContext,
  getSubjectFormulasPreview,
  getSubjectPapers,
} from '../data/subjectExplorer.repository';
import { SubjectPaper, SubjectScreenViewModel, SyllabusChapter } from '../types/subject.types';

export function useSubjectScreen(subjectId: string) {
  const { profile } = useAuth();
  const [selectedPaperNumber, setSelectedPaperNumber] = useState<number>(1);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Subject Metadata
  const { data: allSubjects = [], refetch: refetchSubjects, isLoading: loadingSubject } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => getSubjects(),
    staleTime: 1000 * 60 * 15,
  });

  const subject = useMemo(() => {
    return allSubjects.find((s) => s.id === subjectId) || null;
  }, [allSubjects, subjectId]);

  // 2. Fetch Papers for this Subject
  const { data: papers = [], refetch: refetchPapers, isLoading: loadingPapers } = useQuery({
    queryKey: ['subjects', subjectId, 'papers'],
    queryFn: () => getSubjectPapers(subjectId),
    enabled: Boolean(subjectId),
    staleTime: 1000 * 60 * 15,
  });

  const selectedPaper: SubjectPaper | null = useMemo(() => {
    return papers.find((p) => p.paperNumber === selectedPaperNumber) || papers[0] || null;
  }, [papers, selectedPaperNumber]);

  // 3. Fetch Chapters for Selected Paper
  const activePaperNum = selectedPaper?.paperNumber || 1;
  const {
    data: chapters = [],
    refetch: refetchChapters,
    isLoading: loadingChapters,
  } = useQuery({
    queryKey: ['subjects', subjectId, 'papers', activePaperNum, 'chapters'],
    queryFn: () => getChaptersByPaper(subjectId, activePaperNum),
    enabled: Boolean(subjectId),
    staleTime: 1000 * 60 * 15,
  });

  // 4. Compute Stats & Contexts
  const stats = useMemo(() => computeSubjectStats(chapters), [chapters]);
  const continueStudy = useMemo(() => getContinueSubjectStudyContext(chapters), [chapters]);
  const formulasPreview = useMemo(() => getSubjectFormulasPreview(subjectId), [subjectId]);

  const downloadedCount = useMemo(
    () => chapters.filter((c: SyllabusChapter) => c.isDownloaded).length,
    [chapters]
  );

  const viewModel: SubjectScreenViewModel | null = useMemo(() => {
    if (!subject) return null;

    return {
      subject,
      papers,
      selectedPaper,
      chapters,
      stats,
      continueStudy,
      formulasPreview,
      offlineStatus: {
        downloadedChapters: downloadedCount,
        totalChapters: chapters.length,
      },
    };
  }, [subject, papers, selectedPaper, chapters, stats, continueStudy, formulasPreview, downloadedCount]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchSubjects(), refetchPapers(), refetchChapters()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchSubjects, refetchPapers, refetchChapters]);

  return {
    viewModel,
    selectedPaperNumber,
    setSelectedPaperNumber,
    isLoading: loadingSubject || loadingPapers || loadingChapters,
    refreshing,
    onRefresh,
    isNotFound: !loadingSubject && !subject,
  };
}
