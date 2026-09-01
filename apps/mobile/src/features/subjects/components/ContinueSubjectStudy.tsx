import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import { LinearProgress } from '@/src/components/ui/Progress';
import { ContinueSubjectStudyContext } from '../types/subject.types';

export function ContinueSubjectStudy({
  subjectId,
  context,
}: {
  subjectId: string;
  context: ContinueSubjectStudyContext | null;
}) {
  const theme = useTheme();
  const router = useRouter();
  const subTheme = resolveSubjectTheme(subjectId);

  if (!context) return null;

  const isStarted = context.progress > 0;

  return (
    <Card
      variant="interactive"
      onPress={() => router.push(`/chapter/${context.chapterId}` as any)}
      accessibilityLabel={`Continue studying ${context.chapterTitle}`}
      className="p-4 mb-4"
      style={{
        backgroundColor: theme.colors.surfaceElevated,
        borderColor: subTheme.primary,
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Ionicons
            name={isStarted ? 'time-outline' : 'play-circle-outline'}
            size={16}
            color={subTheme.primary}
          />
          <AppText variant="labelMedium" style={{ color: subTheme.primary }}>
            {isStarted ? 'Continue Studying' : 'Up Next'}
          </AppText>
        </View>

        <AppText variant="caption" color="muted">
          Paper {context.paperNumber} • Chapter {context.chapterNumber}
        </AppText>
      </View>

      <AppText variant="titleMedium" color="primary" numberOfLines={1}>
        {context.chapterTitle}
      </AppText>

      <View className="mt-3">
        <LinearProgress percentage={context.progress} height={4} color={subTheme.primary} />
      </View>
    </Card>
  );
}
