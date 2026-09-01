import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import type { Formula } from '@/src/types/formula.types';
import { Card } from '../ui/Card';
import { AppText } from '../ui/Typography';

export function FormulaCard({
  formula,
  isFavorite = false,
  onToggleFavorite,
  onPress,
  className = '',
}: {
  formula: Formula;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPress?: () => void;
  className?: string;
}) {
  const theme = useTheme();
  const subTheme = resolveSubjectTheme(formula.subjectId);

  return (
    <Card
      variant="interactive"
      onPress={onPress}
      accessibilityLabel={`Formula: ${formula.title}`}
      className={`p-4 mb-3 ${className}`}
    >
      {/* Header: Title, Chapter & Stars */}
      <View className="flex-row items-center justify-between mb-2.5">
        <View className="flex-1 pr-2">
          <View className="flex-row items-center gap-2">
            <AppText variant="labelMedium" color="primary">
              {formula.title}
            </AppText>
            <View
              style={{
                backgroundColor: subTheme.tintBg,
                borderRadius: theme.radius.sm,
                paddingHorizontal: 6,
                paddingVertical: 1,
              }}
            >
              <AppText variant="caption" style={{ color: subTheme.primary, fontSize: 9 }}>
                {formula.chapter}
              </AppText>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {/* Importance Stars */}
          <View className="flex-row">
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={11}
                color={i < formula.importance ? '#FBBF24' : 'rgba(255,255,255,0.15)'}
              />
            ))}
          </View>

          {/* Favorite Toggle */}
          {onToggleFavorite && (
            <Pressable onPress={onToggleFavorite} hitSlop={8} className="active:opacity-75">
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? '#F43F5E' : theme.colors.textMuted}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* LaTeX Equation Hero Box */}
      <View
        style={{
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.md,
          paddingVertical: 12,
          paddingHorizontal: 14,
        }}
        className="items-center justify-center my-1"
      >
        <AppText
          variant="headlineMedium"
          color="mint"
          align="center"
          style={{ letterSpacing: 0.5 }}
        >
          {formula.plain || formula.latex}
        </AppText>
      </View>

      {/* Footer: Usage count & variables indicator */}
      <View className="flex-row items-center justify-between mt-2.5">
        <AppText variant="caption" color="muted">
          Used in {formula.uses} Board Questions
        </AppText>
        {formula.variables && formula.variables.length > 0 && (
          <AppText variant="caption" color="sky">
            {formula.variables.length} Variables defined
          </AppText>
        )}
      </View>
    </Card>
  );
}
