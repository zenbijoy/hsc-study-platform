import React from 'react';
import { View } from 'react-native';
import { ContentCountCard } from '@/src/components/domain/QuestionCards';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { BookDetailsViewModel } from '../types/bookDetails.types';

export function BookStats({
  viewModel,
}: {
  viewModel: BookDetailsViewModel;
}) {
  const subTheme = resolveSubjectTheme(viewModel.book.subjectId);
  const { stats } = viewModel;

  return (
    <View className="flex-row gap-2 mb-4">
      <ContentCountCard
        count={stats.chapterCount}
        label="Chapters"
        icon="book-outline"
        accentColor={subTheme.primary}
      />
      <ContentCountCard
        count={stats.formulaCount}
        label="Formulas"
        icon="calculator-outline"
        accentColor="#57E0B7"
      />
      <ContentCountCard
        count={stats.cqCount}
        label="Board CQs"
        icon="document-text-outline"
        accentColor="#6CB7FF"
      />
      <ContentCountCard
        count={stats.bookmarkCount}
        label="Bookmarks"
        icon="bookmark-outline"
        accentColor="#FF8A76"
      />
    </View>
  );
}
