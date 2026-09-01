import type { Subject } from '@/src/types/subject.types';
import type { Formula } from '@/src/types/formula.types';

export interface SubjectPaper {
  id: string;
  subjectId: string;
  paperNumber: number;
  titleEn: string;
  titleBn: string;
  subtitle?: string;
  sortOrder: number;
}

export interface SyllabusChapter {
  id: string;
  subjectId: string;
  paperNumber: number;
  chapterNumber: number;
  titleEn: string;
  titleBn: string;
  startPage?: number;
  endPage?: number;
  formulaCount: number;
  cqCount: number;
  mcqCount: number;
  bookCount: number;
  progress: number;
  isDownloaded?: boolean;
  isImportant?: boolean;
}

export interface SubjectStats {
  totalChapters: number;
  totalFormulas: number;
  totalCQs: number;
  totalMCQs: number;
  completedChapters: number;
  overallProgress: number;
}

export interface ContinueSubjectStudyContext {
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  paperNumber: number;
  bookId?: string;
  bookTitle?: string;
  pageNumber: number;
  progress: number;
}

export interface SubjectScreenViewModel {
  subject: Subject;
  papers: SubjectPaper[];
  selectedPaper: SubjectPaper | null;
  chapters: SyllabusChapter[];
  stats: SubjectStats;
  continueStudy: ContinueSubjectStudyContext | null;
  formulasPreview: Formula[];
  offlineStatus: {
    downloadedChapters: number;
    totalChapters: number;
  };
}
