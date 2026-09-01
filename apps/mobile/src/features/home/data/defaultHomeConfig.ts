import { HomeSectionConfig, HomeSectionType } from '../types/home.types';

export const WHITELISTED_SECTION_TYPES: HomeSectionType[] = [
  'greeting',
  'continue_reading',
  'subjects',
  'study_progress',
  'quick_actions',
  'formula_of_day',
  'recommended_books',
  'board_practice',
  'recently_added',
  'announcement',
];

export const DEFAULT_HOME_SECTIONS: HomeSectionConfig[] = [
  {
    id: 'sec_continue_reading',
    type: 'continue_reading',
    title: 'Continue Reading',
    subtitle: 'Pick up right where you left off',
    enabled: true,
    order: 1,
    limit: 2,
  },
  {
    id: 'sec_subjects',
    type: 'subjects',
    title: 'Your Subjects',
    subtitle: 'Prioritized for your HSC syllabus',
    enabled: true,
    order: 2,
    variant: 'carousel',
  },
  {
    id: 'sec_study_progress',
    type: 'study_progress',
    title: "Today's Study Goal",
    enabled: true,
    order: 3,
  },
  {
    id: 'sec_quick_actions',
    type: 'quick_actions',
    title: 'Quick Tools',
    enabled: true,
    order: 4,
  },
  {
    id: 'sec_formula_of_day',
    type: 'formula_of_day',
    title: 'Formula of the Day',
    subtitle: 'High-frequency board exam equation',
    enabled: true,
    order: 5,
  },
  {
    id: 'sec_recommended_books',
    type: 'recommended_books',
    title: 'Recommended Textbooks',
    subtitle: 'Curated for your academic group',
    enabled: true,
    order: 6,
    limit: 4,
  },
  {
    id: 'sec_board_practice',
    type: 'board_practice',
    title: 'Board Exam Practice',
    subtitle: 'Targeted past board questions',
    enabled: true,
    order: 7,
  },
  {
    id: 'sec_recently_added',
    type: 'recently_added',
    title: 'Recently Added to Library',
    enabled: true,
    order: 8,
    limit: 3,
  },
];

export function sanitizeAndOrderSections(
  remoteSections?: HomeSectionConfig[] | null
): HomeSectionConfig[] {
  if (!remoteSections || !Array.isArray(remoteSections) || remoteSections.length === 0) {
    return DEFAULT_HOME_SECTIONS;
  }

  const valid = remoteSections.filter(
    (s) => s && s.enabled !== false && WHITELISTED_SECTION_TYPES.includes(s.type)
  );

  if (valid.length === 0) {
    return DEFAULT_HOME_SECTIONS;
  }

  return valid.sort((a, b) => (a.order || 0) - (b.order || 0));
}
