import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { AppText } from '@/src/components/ui/Typography';
import { LinearProgress } from '@/src/components/ui/Progress';
import type { Subject } from '@/src/types/subject.types';

export function SubjectHero({
  subject,
  overallProgress,
  academicBadge,
}: {
  subject: Subject;
  overallProgress: number;
  academicBadge?: string;
}) {
  const theme = useTheme();
  const subTheme = resolveSubjectTheme(subject.id);

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: subTheme.primary,
        borderWidth: 1,
        borderRadius: theme.radius.xxl,
        padding: 18,
      }}
      className="mb-4"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3">
          <View
            style={{
              backgroundColor: subTheme.tintBg,
              borderRadius: theme.radius.lg,
              width: 46,
              height: 46,
            }}
            className="items-center justify-center"
          >
            <Ionicons name={subTheme.icon as any} size={24} color={subTheme.primary} />
          </View>

          <View>
            <AppText variant="headlineMedium" color="primary" style={{ fontWeight: '800' }}>
              {subject.banglaName}
            </AppText>
            <AppText variant="caption" color="muted">
              {subject.name} {academicBadge ? `• ${academicBadge}` : ''}
            </AppText>
          </View>
        </View>

        <View className="items-end">
          <AppText
            variant="headlineMedium"
            style={{ color: subTheme.primary, fontWeight: '800' }}
          >
            {overallProgress}%
          </AppText>
          <AppText variant="caption" color="muted">
            Completed
          </AppText>
        </View>
      </View>

      <LinearProgress percentage={overallProgress} height={6} color={subTheme.primary} />
    </View>
  );
}
