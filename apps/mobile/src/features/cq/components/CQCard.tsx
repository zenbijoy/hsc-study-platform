import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Chip';
import { CanonicalCQ } from '../types/cq.types';

export function CQCard({
  cq,
  isSaved,
  onToggleSave,
}: {
  cq: CanonicalCQ;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Card
      variant="interactive"
      onPress={() => router.push(`/cq/${cq.id}` as any)}
      accessibilityLabel={`Open Creative Question ${cq.title}`}
      className="p-4 mb-3"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
      }}
    >
      {/* Top Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2 flex-wrap">
          <Badge label={cq.board ? `${cq.board} ${cq.year}` : 'PRACTICE CQ'} variant="primary" />
          <AppText variant="caption" color="muted">
            {cq.chapterTitle}
          </AppText>
        </View>

        <View className="flex-row items-center gap-2">
          <View
            style={{
              backgroundColor: 'rgba(87, 224, 183, 0.15)',
              borderRadius: theme.radius.sm,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <AppText variant="caption" color="mint" style={{ fontWeight: '800' }}>
              {cq.totalMarks} MARKS
            </AppText>
          </View>

          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Remove saved question' : 'Save question'}
            className="p-1 active:opacity-60"
          >
            <Ionicons
              name={isSaved ? 'star' : 'star-outline'}
              size={18}
              color={isSaved ? '#FFB86C' : theme.colors.textMuted}
            />
          </Pressable>
        </View>
      </View>

      {/* Stimulus Preview */}
      <AppText variant="titleMedium" color="primary" numberOfLines={2} className="mt-1 font-semibold leading-5">
        {cq.stimulus}
      </AppText>

      {/* Sub-Question Parts Chips */}
      <View className="flex-row gap-1.5 mt-3 mb-2 flex-wrap">
        {cq.subQuestions.map((q) => (
          <View
            key={q.id}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: theme.radius.sm,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
            className="flex-row items-center gap-1"
          >
            <AppText variant="caption" color="mint" style={{ fontWeight: '800' }}>
              {q.banglaLetter}.
            </AppText>
            <AppText variant="caption" color="secondary" numberOfLines={1} style={{ maxWidth: 140 }}>
              {q.question}
            </AppText>
          </View>
        ))}
      </View>

      {/* Footer Info */}
      <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-white/5">
        <AppText variant="caption" color="muted">
          {cq.formulaReferences?.length || 2} formulas linked • Step Solution available
        </AppText>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
      </View>
    </Card>
  );
}
