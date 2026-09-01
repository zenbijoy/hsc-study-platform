import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import type { Subject } from '@/src/types/subject.types';
import { Card } from '../ui/Card';
import { AppText } from '../ui/Typography';
import { LinearProgress } from '../ui/Progress';

export function SubjectCard({
  subject,
  onPress,
  className = '',
}: {
  subject: Subject;
  onPress?: () => void;
  className?: string;
}) {
  const theme = useTheme();
  const subTheme = resolveSubjectTheme(subject.id);

  return (
    <Card
      variant="interactive"
      onPress={onPress}
      accessibilityLabel={`Open ${subject.name}`}
      className={`p-4 mb-3 ${className}`}
      style={{
        borderLeftWidth: 4,
        borderLeftColor: subTheme.primary,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2.5">
          <View
            style={{
              backgroundColor: subTheme.tintBg,
              borderRadius: theme.radius.md,
              width: 36,
              height: 36,
            }}
            className="items-center justify-center"
          >
            <Ionicons name={subTheme.icon as any} size={20} color={subTheme.primary} />
          </View>
          <View>
            <AppText variant="titleMedium" color="primary">
              {subject.banglaName}
            </AppText>
            <AppText variant="caption" color="muted">
              {subject.name}
            </AppText>
          </View>
        </View>

        <View className="items-end">
          <AppText variant="labelMedium" style={{ color: subTheme.primary }}>
            {subject.bookCount} Books
          </AppText>
        </View>
      </View>

      <LinearProgress percentage={subject.progress || 0} height={4} color={subTheme.primary} />
    </Card>
  );
}
