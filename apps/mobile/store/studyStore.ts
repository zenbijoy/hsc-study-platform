import { create } from 'zustand';

export type BookmarkItem = {
  id: string;
  bookId: string;
  page: number;
  chapterTitle?: string;
  note?: string;
  createdAt: number;
};

export type QuizAttempt = {
  id: string;
  subjectId: string;
  chapter?: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timestamp: number;
};

export type ReaderTheme = 'dark' | 'sepia' | 'midnight' | 'light';

type StudyState = {
  // Favorites
  favoriteFormulaIds: string[];
  toggleFavoriteFormula: (id: string) => void;
  isFormulaFavorite: (id: string) => boolean;

  // Bookmarks
  bookmarks: BookmarkItem[];
  addBookmark: (bookmark: Omit<BookmarkItem, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  getBookBookmarks: (bookId: string) => BookmarkItem[];

  // Quiz Stats
  quizAttempts: QuizAttempt[];
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'timestamp' | 'accuracy'>) => void;
  getTotalQuizzesSolved: () => number;
  getAverageAccuracy: () => number;

  // Streaks
  streakDays: number;
  lastStudyDate: string;
  recordStudySession: () => void;

  // Reader Settings
  readerTheme: ReaderTheme;
  setReaderTheme: (theme: ReaderTheme) => void;
};

export const useStudyStore = create<StudyState>((set, get) => ({
  favoriteFormulaIds: ['f-1', 'f-3'],
  toggleFavoriteFormula: (id: string) =>
    set((state) => {
      const exists = state.favoriteFormulaIds.includes(id);
      return {
        favoriteFormulaIds: exists
          ? state.favoriteFormulaIds.filter((fId) => fId !== id)
          : [...state.favoriteFormulaIds, id],
      };
    }),
  isFormulaFavorite: (id: string) => get().favoriteFormulaIds.includes(id),

  bookmarks: [
    {
      id: 'bm-1',
      bookId: 'demo-physics-1',
      page: 196,
      chapterTitle: 'Newtonian Mechanics',
      note: 'Revise banking angle derivation before model test',
      createdAt: Date.now() - 86400000,
    },
  ],
  addBookmark: (bookmark) =>
    set((state) => ({
      bookmarks: [
        ...state.bookmarks,
        {
          ...bookmark,
          id: `bm-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
          createdAt: Date.now(),
        },
      ],
    })),
  removeBookmark: (id: string) =>
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
    })),
  getBookBookmarks: (bookId: string) =>
    get().bookmarks.filter((b) => b.bookId === bookId),

  quizAttempts: [
    {
      id: 'q-init-1',
      subjectId: 'physics',
      chapter: 'Newtonian Mechanics',
      score: 4,
      totalQuestions: 5,
      accuracy: 80,
      timestamp: Date.now() - 3600000 * 4,
    },
    {
      id: 'q-init-2',
      subjectId: 'physics',
      chapter: 'Vectors',
      score: 5,
      totalQuestions: 5,
      accuracy: 100,
      timestamp: Date.now() - 86400000,
    },
  ],
  recordQuizAttempt: (attempt) =>
    set((state) => {
      const accuracy = Math.round((attempt.score / Math.max(1, attempt.totalQuestions)) * 100);
      const newAttempt: QuizAttempt = {
        ...attempt,
        id: `qa-${Date.now()}`,
        accuracy,
        timestamp: Date.now(),
      };
      return { quizAttempts: [newAttempt, ...state.quizAttempts] };
    }),
  getTotalQuizzesSolved: () => {
    return get().quizAttempts.reduce((acc, q) => acc + q.totalQuestions, 0);
  },
  getAverageAccuracy: () => {
    const list = get().quizAttempts;
    if (!list.length) return 0;
    const sum = list.reduce((acc, q) => acc + q.accuracy, 0);
    return Math.round(sum / list.length);
  },

  streakDays: 7,
  lastStudyDate: new Date().toISOString().split('T')[0] ?? '',
  recordStudySession: () => {
    const today = new Date().toISOString().split('T')[0] ?? '';
    const { lastStudyDate, streakDays } = get();
    if (lastStudyDate === today) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0] ?? '';
    if (lastStudyDate === yesterday) {
      set({ streakDays: streakDays + 1, lastStudyDate: today });
    } else {
      set({ streakDays: 1, lastStudyDate: today });
    }
  },

  readerTheme: 'dark',
  setReaderTheme: (theme: ReaderTheme) => set({ readerTheme: theme }),
}));
