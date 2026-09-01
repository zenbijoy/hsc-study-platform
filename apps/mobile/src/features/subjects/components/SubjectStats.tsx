import React from 'react';
import { View } from 'react-native';
import { ContentCountCard } from '@/src/components/domain/QuestionCards';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { SubjectStats as SubjectStatsType } from '../types/subject.types';

export function SubjectStats({
  subjectId,
  stats,
}: {
  subjectId: string;
  stats: SubjectStatsType;
}) {
  const subTheme = resolveSubjectTheme(subjectId);

  return (
    <View className="flex-row gap-2 mb-4">
      <ContentCountCard
        count={stats.totalChapters}
        label="Chapters"
        icon="book-outline"
        accentColor={subTheme.primary}
      />
      <ContentCountCard
        count={stats.totalFormulas}
        label="Formulas"
        icon="calculator-outline"
        accentColor="#57E0B7"
      />
      <ContentCountCard
        count={stats.totalCQs}
        label="Board CQs"
        icon="document-text-outline"
        accentColor="#6CB7FF"
      />
      <ContentCountCard
        count={stats.totalMCQs}
        label="MCQs"
        icon="checkbox-outline"
        accentColor="#A58BFF"
      />
    </View>
  );
}
