export interface FormulaVariable {
  symbol: string;
  meaningBn: string;
  meaningEn?: string;
  unit?: string;
  dimension?: string;
}

export interface FormulaUnit {
  siUnit: string;
  alternativeUnits?: string[];
  dimension?: string;
}

export interface FormulaBookReference {
  bookId: string;
  bookTitle: string;
  pageNumber: number;
  chapterTitle?: string;
}

export interface FormulaKnowledgeLinks {
  relatedConcepts: string[];
  relatedFormulas: { id: string; title: string; latex: string }[];
  bookReferences: FormulaBookReference[];
  cqCount: number;
  mcqCount: number;
}

export interface CanonicalFormula {
  id: string;
  subjectId: string;
  subjectName?: string;
  paperNumber?: number;
  chapterId?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  conceptId?: string;
  conceptName?: string;
  titleBn: string;
  titleEn?: string;
  latex: string;
  plainText?: string;
  explanationBn?: string;
  explanationEn?: string;
  variables: FormulaVariable[];
  units?: FormulaUnit;
  conditions?: string[];
  tags: string[];
  importance: number; // 1 to 5
  difficulty?: number;
  isFeatured?: boolean;
  usageCount: number;
  version: number;
  knowledgeLinks?: FormulaKnowledgeLinks;
}

export interface FormulaFilters {
  subjectIds: string[];
  paperNumbers: number[];
  chapterIds: string[];
  minImportance?: number;
  savedOnly: boolean;
  dueRevisionOnly: boolean;
}

export interface FormulaRevisionItem {
  formula: CanonicalFormula;
  lastReviewedAt?: string;
  nextReviewAt: string;
  reviewCount: number;
  repetitionStage: number; // 0, 1, 2, 3...
}
