import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import { LinearProgress } from '@/src/components/ui/Progress';
import { BookDetailsViewModel } from '../types/bookDetails.types';

export function BookProgressCard({
  viewModel,
}: {
  viewModel: BookDetailsViewModel;
}) {
  const theme = useTheme();
  const subTheme = resolveSubjectTheme(viewModel.book.subjectId);
  const { progressPercentage, currentPage, totalPages, currentChapterTitle, lastReadAt } =
    viewModel.progress;

  if (progressPercentage <= 0) return null;

  return (
    <Card
      variant="flat"
      className="p-4 mb-4"
      style={{
        backgroundColor: theme.colors.surfaceElevated,
        borderColor: theme.colors.border,
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="time-outline" size={16} color={subTheme.primary} />
          <AppText variant="labelMedium" color="primary" style={{ fontWeight: '700' }}>
            Reading Progress
          </AppText>
        </View>

        <AppText variant="caption" style={{ color: subTheme.primary, fontWeight: '800' }}>
          Page {currentPage} of {totalPages} ({progressPercentage}%)
        </AppText>
      </View>

      <LinearProgress percentage={progressPercentage} height={5} color={subTheme.primary} />

      <View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-white/5">
        <AppText variant="caption" color="secondary" numberOfLines={1} className="flex-1 pr-2">
          {currentChapterTitle}
        </AppText>
        {lastReadAt && (
          <AppText variant="caption" color="muted">
            Last read: {lastReadAt}
          </AppText>
        )}
      </View>
    </Card>
  );
}
