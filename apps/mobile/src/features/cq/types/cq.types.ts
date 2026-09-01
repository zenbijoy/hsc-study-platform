export interface CQPart {
  id: string;
  letter: string; // 'a' | 'b' | 'c' | 'd'
  banglaLetter: string; // 'ক' | 'খ' | 'গ' | 'ঘ'
  question: string;
  marks: number;
  solution?: string;
  formulaIds?: string[];
}

export interface CQSolutionStep {
  order: number;
  title: string;
  content: string;
  formulaLatex?: string;
}

export interface CQBookReference {
  bookId: string;
  bookTitle: string;
  pageNumber: number;
  chapterTitle?: string;
}

export interface CQFormulaReference {
  id: string;
  title: string;
  latex: string;
}

export interface CanonicalCQ {
  id: string;
  subjectId: string;
  subjectName?: string;
  paperNumber?: number;
  chapterId?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  title: string;
  board?: string;
  year?: number;
  isOfficialBoard: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced';
  importance: number; // 1 to 5
  stimulus: string;
  subQuestions: CQPart[];
  totalMarks: number;
  formulaReferences?: CQFormulaReference[];
  bookReferences?: CQBookReference[];
  tags: string[];
  version: number;
}

export interface CQFilters {
  subjectId: string;
  board?: string;
  year?: number;
  savedOnly: boolean;
  officialOnly: boolean;
}

export interface CQPracticeSession {
  sessionId: string;
  questions: CanonicalCQ[];
  currentIndex: number;
  revealedAnswers: Record<string, boolean>;
  ratings: Record<string, 'got_it' | 'need_review'>;
  isCompleted: boolean;
}
