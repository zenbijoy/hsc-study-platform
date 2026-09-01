import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Chip';
import { Section, SectionHeader } from '@/src/components/ui/Layout';
import { BoardPracticeInfo } from '../types/home.types';

export function BoardPracticeSection({
  boardInfo,
  title = 'Board Exam Practice',
  subtitle = 'Targeted past board questions',
}: {
  boardInfo: BoardPracticeInfo | null;
  title?: string;
  subtitle?: string;
}) {
  const theme = useTheme();
  const router = useRouter();

  if (!boardInfo) return null;

  return (
    <Section className="mb-4">
      <SectionHeader title={title} subtitle={subtitle} />
      <Card
        variant="interactive"
        onPress={() => router.push('/(tabs)/practice' as any)}
        className="p-4"
        style={{
          borderLeftWidth: 4,
          borderLeftColor: '#6CB7FF',
        }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <View
              style={{
                backgroundColor: 'rgba(108, 183, 255, 0.15)',
                borderRadius: theme.radius.md,
                width: 36,
                height: 36,
              }}
              className="items-center justify-center"
            >
              <Ionicons name="school" size={20} color="#6CB7FF" />
            </View>
            <View>
              <AppText variant="titleMedium" color="primary">
                {boardInfo.boardName} Board Standard
              </AppText>
              <AppText variant="caption" color="muted">
                {boardInfo.boardNameBn}
              </AppText>
            </View>
          </View>

          <Badge label="2019-2025" variant="primary" />
        </View>

        <View className="flex-row items-center gap-4 mt-2 pt-2 border-t border-white/5">
          <View className="flex-row items-center gap-1.5">
            <AppText variant="labelMedium" color="sky">
              {boardInfo.totalCQs} CQs
            </AppText>
            <AppText variant="caption" color="muted">
              (ক, খ, গ, ঘ)
            </AppText>
          </View>

          <AppText variant="caption" color="muted">•</AppText>

          <View className="flex-row items-center gap-1.5">
            <AppText variant="labelMedium" color="mint">
              {boardInfo.totalMCQs} MCQs
            </AppText>
            <AppText variant="caption" color="muted">
              with derivations
            </AppText>
          </View>
        </View>
      </Card>
    </Section>
  );
}
