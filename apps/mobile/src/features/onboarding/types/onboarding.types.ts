export type OnboardingStep =
  | 'WELCOME'
  | 'ACADEMIC_YEAR'
  | 'GROUP'
  | 'BOARD'
  | 'SUBJECTS'
  | 'PREFERENCES'
  | 'REVIEW'
  | 'SAVING'
  | 'COMPLETE';

export type StudentGroup = 'science' | 'business' | 'humanities';

export type StudyFocus = 'textbooks' | 'formulas' | 'board_cq' | 'mcq_practice' | 'revision';

export interface EducationBoardOption {
  id: string;
  nameEn: string;
  nameBn: string;
  isGeneral: boolean;
}

export interface AcademicYearOption {
  year: number;
  labelEn: string;
  labelBn: string;
  isCurrent: boolean;
}

export interface StudentGroupOption {
  id: StudentGroup;
  nameEn: string;
  nameBn: string;
  description: string;
  isAvailable: boolean;
  icon: string;
}

export interface OnboardingDraft {
  step: OnboardingStep;
  hscYear?: number;
  studentGroup?: StudentGroup;
  board?: string;
  preferredSubjectIds: string[];
  studyFocus: StudyFocus[];
  dailyGoalMinutes: number;
  lastUpdated: string;
}

export interface CompleteOnboardingPayload {
  hscYear: number;
  studentGroup: StudentGroup;
  board: string;
  preferredSubjectIds: string[];
  studyFocus: StudyFocus[];
  dailyGoalMinutes: number;
}
