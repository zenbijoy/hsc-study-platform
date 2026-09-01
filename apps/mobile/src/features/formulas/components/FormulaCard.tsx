import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Chip';
import { CanonicalFormula } from '../types/formula.types';

export function FormulaCard({
  formula,
  isSaved,
  onToggleSave,
}: {
  formula: CanonicalFormula;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const theme = useTheme();
  const router = useRouter();
  const subTheme = resolveSubjectTheme(formula.subjectId);

  return (
    <Card
      variant="interactive"
      onPress={() => router.push(`/formula/${formula.id}` as any)}
      accessibilityLabel={`Open formula ${formula.titleBn}`}
      className="p-4 mb-3"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
      }}
    >
      {/* Top Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Badge label={formula.subjectId.toUpperCase()} variant="primary" />
          <AppText variant="caption" color="muted">
            {formula.chapterTitle}
          </AppText>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Remove saved formula' : 'Save formula'}
          className="p-1 active:opacity-60"
        >
          <Ionicons
            name={isSaved ? 'star' : 'star-outline'}
            size={18}
            color={isSaved ? '#FFB86C' : theme.colors.textMuted}
          />
        </Pressable>
      </View>

      {/* LaTeX Equation Hero Box */}
      <View
        style={{
          backgroundColor: '#05090D',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: 1,
          borderRadius: theme.radius.lg,
          paddingVertical: 14,
          paddingHorizontal: 16,
        }}
        className="items-center justify-center my-2"
      >
        <AppText
          variant="titleLarge"
          style={{ color: subTheme.primary, fontFamily: 'monospace', fontWeight: '800' }}
        >
          {formula.latex}
        </AppText>
      </View>

      {/* Title & Cross-Links */}
      <View className="flex-row items-center justify-between mt-2">
        <View className="flex-1 pr-2">
          <AppText variant="titleMedium" color="primary" numberOfLines={1}>
            {formula.titleBn}
          </AppText>
          <AppText variant="caption" color="secondary" className="mt-0.5">
            {formula.variables.length} Variables • {formula.knowledgeLinks?.cqCount || 17} CQs • {formula.knowledgeLinks?.mcqCount || 34} MCQs
          </AppText>
        </View>

        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
      </View>
    </Card>
  );
}
