import { isSupabaseConfigured, supabase } from '@/src/lib/supabase/client';
import { SubjectPaper, SyllabusChapter, SubjectStats, ContinueSubjectStudyContext } from '../types/subject.types';
import { DEFAULT_SUBJECT_PAPERS, DEFAULT_SYLLABUS_CHAPTERS } from './subjectFixtures';
import { bengaliFormulasFixture } from '@/src/fixtures/bengaliFixtures';
import type { Formula } from '@/src/types/formula.types';

export async function getSubjectPapers(subjectId: string): Promise<SubjectPaper[]> {
  const localDefault = DEFAULT_SUBJECT_PAPERS[subjectId] || [
    {
      id: `${subjectId}-p1`,
      subjectId,
      paperNumber: 1,
      titleEn: '1st Paper',
      titleBn: 'প্রথম পত্র',
      sortOrder: 1,
    },
  ];

  if (!isSupabaseConfigured) {
    return localDefault;
  }

  try {
    const { data, error } = await supabase
      .from('syllabus_chapters')
      .select('paper')
      .eq('subject_id', subjectId);

    if (error || !data || data.length === 0) {
      return localDefault;
    }

    const uniquePapers = Array.from(new Set(data.map((d: any) => d.paper || 1))).sort();
    return uniquePapers.map((paperNum) => ({
      id: `${subjectId}-p${paperNum}`,
      subjectId,
      paperNumber: paperNum,
      titleEn: `${paperNum}${paperNum === 1 ? 'st' : 'nd'} Paper`,
      titleBn: paperNum === 1 ? 'প্রথম পত্র' : 'দ্বিতীয় পত্র',
      sortOrder: paperNum,
    }));
  } catch {
    return localDefault;
  }
}

export async function getChaptersByPaper(
  subjectId: string,
  paperNumber: number
): Promise<SyllabusChapter[]> {
  const paperKey = `${subjectId}-p${paperNumber}`;
  const localDefault = DEFAULT_SYLLABUS_CHAPTERS[paperKey] || [];

  if (!isSupabaseConfigured) {
    return localDefault;
  }

  try {
    const { data, error } = await supabase
      .from('syllabus_chapters')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('paper', paperNumber)
      .order('sort_order');

    if (error || !data || data.length === 0) {
      return localDefault;
    }

    return data.map((c: any, index: number) => ({
      id: c.id,
      subjectId: c.subject_id,
      paperNumber: c.paper || paperNumber,
      chapterNumber: c.sort_order || index + 1,
      titleEn: c.title_en || `Chapter ${index + 1}`,
      titleBn: c.title_bn || `অধ্যায় ${index + 1}`,
      formulaCount: 20,
      cqCount: 35,
      mcqCount: 150,
      bookCount: 3,
      progress: 0,
    }));
  } catch {
    return localDefault;
  }
}

export function computeSubjectStats(chapters: SyllabusChapter[]): SubjectStats {
  const totalChapters = chapters.length;
  let totalFormulas = 0;
  let totalCQs = 0;
  let totalMCQs = 0;
  let completedChapters = 0;
  let totalProgress = 0;

  for (const ch of chapters) {
    totalFormulas += ch.formulaCount || 0;
    totalCQs += ch.cqCount || 0;
    totalMCQs += ch.mcqCount || 0;
    if (ch.progress >= 100) completedChapters++;
    totalProgress += ch.progress || 0;
  }

  const overallProgress = totalChapters > 0 ? Math.round(totalProgress / totalChapters) : 0;

  return {
    totalChapters,
    totalFormulas,
    totalCQs,
    totalMCQs,
    completedChapters,
    overallProgress,
  };
}

export function getSubjectFormulasPreview(subjectId: string): Formula[] {
  return bengaliFormulasFixture.filter((f) => f.subjectId === subjectId).slice(0, 3);
}

export function getContinueSubjectStudyContext(
  chapters: SyllabusChapter[]
): ContinueSubjectStudyContext | null {
  // Find in-progress chapter first, then first incomplete chapter
  const inProgress = chapters.find((c) => c.progress > 0 && c.progress < 100);
  if (inProgress) {
    return {
      chapterId: inProgress.id,
      chapterNumber: inProgress.chapterNumber,
      chapterTitle: inProgress.titleBn || inProgress.titleEn,
      paperNumber: inProgress.paperNumber,
      pageNumber: inProgress.startPage || 146,
      progress: inProgress.progress,
    };
  }

  const firstChapter = chapters[0];
  if (firstChapter) {
    return {
      chapterId: firstChapter.id,
      chapterNumber: firstChapter.chapterNumber,
      chapterTitle: firstChapter.titleBn || firstChapter.titleEn,
      paperNumber: firstChapter.paperNumber,
      pageNumber: firstChapter.startPage || 1,
      progress: firstChapter.progress || 0,
    };
  }

  return null;
}
