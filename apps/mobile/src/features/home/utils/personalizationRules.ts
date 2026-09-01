import type { Book } from '@/src/types/book.types';
import type { Formula } from '@/src/types/formula.types';
import type { UserProfile } from '@/src/types/auth.types';
import { getPreferredSubjectIds } from '@/src/features/onboarding/selectors/personalization';
import { bengaliFormulasFixture } from '@/src/fixtures/bengaliFixtures';
import { QuickActionItem } from '../types/home.types';

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Ready for late-night study?';
}

export function computeRecommendationScore(
  book: Book,
  profile?: UserProfile | null
): number {
  let score = 0;
  const preferredSubjects = getPreferredSubjectIds(profile);

  // 1. Preferred Subject Match (+50 points)
  if (preferredSubjects.includes(book.subjectId)) {
    score += 50;
  }

  // 2. Unfinished Reading in Progress (+30 points)
  if (book.progress && book.progress > 0 && book.progress < 100) {
    score += 30;
  }

  // 3. Core Academic Subject Priority (+15 points)
  if (['physics', 'chemistry', 'mathematics'].includes(book.subjectId)) {
    score += 15;
  }

  // 4. Formula & Chapter Density (+10 points)
  if (book.formulas > 50) {
    score += 10;
  }

  return score;
}

export function sortBooksByPersonalization(
  books: Book[],
  profile?: UserProfile | null
): Book[] {
  return [...books].sort((a, b) => {
    const scoreA = computeRecommendationScore(a, profile);
    const scoreB = computeRecommendationScore(b, profile);
    return scoreB - scoreA;
  });
}

export function getDeterministicDailyFormula(
  formulas: Formula[] = bengaliFormulasFixture,
  profile?: UserProfile | null
): Formula | null {
  if (!formulas || formulas.length === 0) return null;

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const preferredSubjects = getPreferredSubjectIds(profile);
  const filtered = formulas.filter((f) => preferredSubjects.includes(f.subjectId));
  const pool = filtered.length > 0 ? filtered : formulas;

  const index = dayOfYear % pool.length;
  return pool[index] || formulas[0] || null;
}

export const DEFAULT_QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'formula_vault',
    label: 'Formula Vault',
    icon: 'calculator',
    accentColor: '#57E0B7',
    route: '/(tabs)/formulas',
    badge: '140+ Formulas',
  },
  {
    id: 'board_cqs',
    label: 'Board CQs',
    icon: 'document-text',
    accentColor: '#6CB7FF',
    route: '/(tabs)/practice',
    badge: '2019-2025',
  },
  {
    id: 'mcq_sprint',
    label: 'MCQ Sprint',
    icon: 'flash',
    accentColor: '#A58BFF',
    route: '/(tabs)/practice',
    badge: 'Daily Quiz',
  },
  {
    id: 'my_downloads',
    label: 'Offline Books',
    icon: 'cloud-done',
    accentColor: '#FF8A76',
    route: '/(tabs)/library',
    badge: 'Protected',
  },
];
