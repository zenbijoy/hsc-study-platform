import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import type { Chapter } from '@/src/types/book.types';
import { Card } from '../ui/Card';
import { AppText } from '../ui/Typography';

export function ChapterCard({
  chapter,
  onPress,
  className = '',
}: {
  chapter: Chapter;
  onPress: () => void;
  className?: string;
}) {
  const theme = useTheme();

  return (
    <Card
      variant="interactive"
      onPress={onPress}
      accessibilityLabel={`Open chapter ${chapter.chapterNumber}`}
      className={`p-3.5 mb-2.5 ${className}`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 gap-3">
          <View
            style={{
              backgroundColor: 'rgba(87, 224, 183, 0.12)',
              borderRadius: theme.radius.md,
              width: 36,
              height: 36,
            }}
            className="items-center justify-center"
          >
            <AppText variant="labelMedium" color="mint">
              {String(chapter.chapterNumber).padStart(2, '0')}
            </AppText>
          </View>

          <View className="flex-1">
            <AppText variant="titleMedium" color="primary" numberOfLines={1}>
              {chapter.title}
            </AppText>
            <View className="flex-row items-center gap-2 mt-1">
              <AppText variant="caption" color="muted">
                pp. {chapter.startPage}–{chapter.endPage}
              </AppText>
              <AppText variant="caption" color="muted">•</AppText>
              <AppText variant="caption" color="mint">
                {chapter.formulaCount} Formulas
              </AppText>
              <AppText variant="caption" color="muted">•</AppText>
              <AppText variant="caption" color="sky">
                {chapter.cqCount} CQs
              </AppText>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </View>
    </Card>
  );
}
