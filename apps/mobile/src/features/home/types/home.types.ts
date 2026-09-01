import type { Book } from '@/src/types/book.types';
import type { Subject } from '@/src/types/subject.types';
import type { Formula } from '@/src/types/formula.types';
import type { Ionicons } from '@expo/vector-icons';

export type HomeSectionType =
  | 'greeting'
  | 'continue_reading'
  | 'subjects'
  | 'study_progress'
  | 'quick_actions'
  | 'formula_of_day'
  | 'recommended_books'
  | 'board_practice'
  | 'recently_added'
  | 'announcement';

export interface HomeSectionConfig {
  id: string;
  type: HomeSectionType;
  title?: string;
  subtitle?: string;
  enabled: boolean;
  order: number;
  variant?: 'standard' | 'compact' | 'hero' | 'grid' | 'carousel';
  limit?: number;
}

export interface QuickActionItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  route: string;
  badge?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  actionType: 'open_book' | 'open_subject' | 'open_formula' | 'open_screen';
  actionTarget: string;
  actionLabel?: string;
  startsAt?: string;
  endsAt?: string;
}

export interface BoardPracticeInfo {
  boardId: string;
  boardName: string;
  boardNameBn: string;
  totalCQs: number;
  totalMCQs: number;
  availableYears: number[];
}

export interface StudyProgressSummary {
  todayMinutes: number;
  dailyGoalMinutes: number;
  booksInProgress: number;
  chaptersCompleted: number;
  streakDays: number;
}

export interface HomeViewModel {
  greeting: {
    studentName: string;
    greetingText: string;
    academicContext: string;
  };
  continueReading: Book[];
  subjects: Subject[];
  progress: StudyProgressSummary;
  quickActions: QuickActionItem[];
  dailyFormula: Formula | null;
  recommendedBooks: Book[];
  boardPractice: BoardPracticeInfo | null;
  recentlyAddedBooks: Book[];
  announcements: AnnouncementItem[];
}
