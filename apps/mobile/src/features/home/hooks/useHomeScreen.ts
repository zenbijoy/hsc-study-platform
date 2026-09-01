import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/providers/AuthProvider';
import { queryKeys } from '@/src/lib/query/queryKeys';
import { getSubjects } from '@/src/repositories/subjects.repository';
import { getBooks } from '@/src/repositories/books.repository';
import { getStudentAcademicContext } from '@/src/features/onboarding/selectors/personalization';
import { bengaliBooksFixture } from '@/src/fixtures/bengaliFixtures';
import type { Book } from '@/src/types/book.types';
import {
  DEFAULT_QUICK_ACTIONS,
  getDeterministicDailyFormula,
  getTimeBasedGreeting,
  sortBooksByPersonalization,
} from '../utils/personalizationRules';
import { DEFAULT_HOME_SECTIONS, sanitizeAndOrderSections } from '../data/defaultHomeConfig';
import { HomeSectionConfig, HomeViewModel } from '../types/home.types';

export function useHomeScreen() {
  const { profile, refreshProfile } = useAuth();
  const academicContext = getStudentAcademicContext(profile);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Subjects (Local SQLite First, then Remote)
  const { data: subjects = [], refetch: refetchSubjects, isLoading: loadingSubjects } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => getSubjects(),
    staleTime: 1000 * 60 * 15, // 15 mins
  });

  // 2. Fetch Books Catalog
  const { data: rawBooks = bengaliBooksFixture, refetch: refetchBooks, isLoading: loadingBooks } = useQuery({
    queryKey: queryKeys.books.all,
    queryFn: () => getBooks(),
    staleTime: 1000 * 60 * 15,
  });

  // Sort subjects: Student's preferred subjects first
  const preferredIds = academicContext.preferredSubjectIds;
  const sortedSubjects = [...subjects].sort((a, b) => {
    const aPref = preferredIds.includes(a.id);
    const bPref = preferredIds.includes(b.id);
    if (aPref && !bPref) return -1;
    if (!aPref && bPref) return 1;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  // Continue Reading (Books with progress > 0)
  const continueReading = (rawBooks as Book[])
    .filter((b: Book) => (b.progress || 0) > 0)
    .slice(0, 3);

  // Recommended Books
  const recommendedBooks = sortBooksByPersonalization(rawBooks as Book[], profile).slice(0, 5);

  // Recently Added Books
  const recentlyAddedBooks = [...(rawBooks as Book[])].slice(0, 4);

  // Daily Formula
  const dailyFormula = getDeterministicDailyFormula(undefined, profile);

  // Assembly of ViewModel
  const viewModel: HomeViewModel = {
    greeting: {
      studentName: profile?.fullName || 'Student',
      greetingText: getTimeBasedGreeting(),
      academicContext: academicContext.formattedTitle,
    },
    continueReading,
    subjects: sortedSubjects,
    progress: {
      todayMinutes: 18,
      dailyGoalMinutes: academicContext.dailyGoalMinutes,
      booksInProgress: continueReading.length,
      chaptersCompleted: 14,
      streakDays: 3,
    },
    quickActions: DEFAULT_QUICK_ACTIONS,
    dailyFormula,
    recommendedBooks,
    boardPractice: {
      boardId: academicContext.board.toLowerCase(),
      boardName: academicContext.board,
      boardNameBn: `${academicContext.board} বোর্ড`,
      totalCQs: 84,
      totalMCQs: 316,
      availableYears: [2025, 2024, 2023, 2022],
    },
    recentlyAddedBooks,
    announcements: [],
  };

  const sections: HomeSectionConfig[] = sanitizeAndOrderSections(DEFAULT_HOME_SECTIONS);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProfile(), refetchSubjects(), refetchBooks()]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile, refetchSubjects, refetchBooks]);

  return {
    viewModel,
    sections,
    isLoading: loadingSubjects || loadingBooks,
    refreshing,
    onRefresh,
  };
}
