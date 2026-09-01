import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import { LinearProgress } from '@/src/components/ui/Progress';
import { StudyProgressSummary } from '../types/home.types';

export function StudyProgressSection({
  progress,
  title = "Today's Study Goal",
}: {
  progress: StudyProgressSummary;
  title?: string;
}) {
  const theme = useTheme();
  const percentage = Math.min(
    100,
    Math.round((progress.todayMinutes / (progress.dailyGoalMinutes || 30)) * 100)
  );

  return (
    <Card variant="flat" className="p-4 mb-4" style={{ backgroundColor: theme.colors.surfaceElevated }}>
      <View className="flex-row items-center justify-between mb-2.5">
        <View className="flex-row items-center gap-2">
          <View
            style={{
              backgroundColor: 'rgba(87, 224, 183, 0.15)',
              borderRadius: theme.radius.full,
              padding: 5,
            }}
          >
            <Ionicons name="flame" size={16} color="#FBBF24" />
          </View>
          <AppText variant="titleMedium" color="primary">
            {title}
          </AppText>
        </View>

        <AppText variant="caption" color="mint" style={{ fontWeight: '700' }}>
          {progress.todayMinutes} / {progress.dailyGoalMinutes} min ({percentage}%)
        </AppText>
      </View>

      <LinearProgress percentage={percentage} height={6} color={theme.colors.primary} />

      <View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-white/5">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="book-outline" size={14} color={theme.colors.textMuted} />
          <AppText variant="caption" color="muted">
            {progress.booksInProgress} Books in progress
          </AppText>
        </View>

        <View className="flex-row items-center gap-1.5">
          <Ionicons name="checkmark-circle-outline" size={14} color={theme.colors.success} />
          <AppText variant="caption" color="muted">
            {progress.chaptersCompleted} Chapters done
          </AppText>
        </View>
      </View>
    </Card>
  );
}
