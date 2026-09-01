import React from 'react';
import { HomeSectionConfig, HomeViewModel } from '../types/home.types';
import { ContinueReadingSection } from './ContinueReadingSection';
import { SubjectsSection } from './SubjectsSection';
import { StudyProgressSection } from './StudyProgressSection';
import { QuickActionsSection } from './QuickActionsSection';
import { FormulaOfDaySection } from './FormulaOfDaySection';
import { RecommendedBooksSection } from './RecommendedBooksSection';
import { BoardPracticeSection } from './BoardPracticeSection';
import { RecentlyAddedSection, AnnouncementBanner } from './RecentlyAddedSection';

export function renderHomeSection(
  section: HomeSectionConfig,
  viewModel: HomeViewModel
): React.ReactNode {
  if (!section.enabled) return null;

  switch (section.type) {
    case 'continue_reading':
      return (
        <ContinueReadingSection
          key={section.id}
          books={viewModel.continueReading}
          title={section.title}
          subtitle={section.subtitle}
        />
      );

    case 'subjects':
      return (
        <SubjectsSection
          key={section.id}
          subjects={viewModel.subjects}
          title={section.title}
          subtitle={section.subtitle}
        />
      );

    case 'study_progress':
      return (
        <StudyProgressSection
          key={section.id}
          progress={viewModel.progress}
          title={section.title}
        />
      );

    case 'quick_actions':
      return (
        <QuickActionsSection
          key={section.id}
          actions={viewModel.quickActions}
          title={section.title}
        />
      );

    case 'formula_of_day':
      return (
        <FormulaOfDaySection
          key={section.id}
          formula={viewModel.dailyFormula}
          title={section.title}
          subtitle={section.subtitle}
        />
      );

    case 'recommended_books':
      return (
        <RecommendedBooksSection
          key={section.id}
          books={viewModel.recommendedBooks}
          title={section.title}
          subtitle={section.subtitle}
        />
      );

    case 'board_practice':
      return (
        <BoardPracticeSection
          key={section.id}
          boardInfo={viewModel.boardPractice}
          title={section.title}
          subtitle={section.subtitle}
        />
      );

    case 'recently_added':
      return (
        <RecentlyAddedSection
          key={section.id}
          books={viewModel.recentlyAddedBooks}
          title={section.title}
        />
      );

    case 'announcement':
      if (viewModel.announcements.length === 0) return null;
      return (
        <AnnouncementBanner
          key={section.id}
          announcement={viewModel.announcements[0]!}
        />
      );

    default:
      if (__DEV__) {
        console.warn(`[HomeSectionRegistry] Unsupported section type: ${(section as any).type}`);
      }
      return null;
  }
}
