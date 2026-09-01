import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import type { CQQuestion, MCQQuestion } from '@/src/types/question.types';
import { Card } from '../ui/Card';
import { AppText } from '../ui/Typography';
import { Chip, Badge } from '../ui/Chip';

export function CQCard({
  cq,
  onPress,
  className = '',
}: {
  cq: CQQuestion;
  onPress: () => void;
  className?: string;
}) {
  const theme = useTheme();
  const subTheme = resolveSubjectTheme(cq.subjectId);

  return (
    <Card
      variant="interactive"
      onPress={onPress}
      accessibilityLabel={`Open CQ: ${cq.title}`}
      className={`p-4 mb-3 ${className}`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          {cq.board && (
            <Chip
              label={`${cq.board} '${cq.year ? String(cq.year).slice(-2) : ''}`}
              variant="subject"
              accentColor={subTheme.primary}
            />
          )}
          <AppText variant="caption" color="muted">
            {cq.chapter}
          </AppText>
        </View>

        <Badge label="10 MARKS" variant="primary" />
      </View>

      <AppText variant="titleMedium" color="primary" numberOfLines={1}>
        {cq.title}
      </AppText>

      <View
        style={{
          backgroundColor: theme.colors.surfaceElevated,
          borderRadius: theme.radius.md,
          padding: 10,
        }}
        className="my-2.5"
      >
        <AppText variant="bodySmall" color="secondary" numberOfLines={2} className="leading-5">
          {cq.stimulus}
        </AppText>
      </View>

      <View className="flex-row items-center justify-between">
        <AppText variant="caption" color="sky">
          {cq.subQuestions.length} Sub-questions (ক, খ, গ, ঘ)
        </AppText>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
      </View>
    </Card>
  );
}

export function MCQCard({
  mcq,
  selectedIndex,
  onSelectOption,
  showExplanation = false,
  className = '',
}: {
  mcq: MCQQuestion;
  selectedIndex?: number | null;
  onSelectOption?: (index: number) => void;
  showExplanation?: boolean;
  className?: string;
}) {
  const theme = useTheme();

  return (
    <Card variant="outlined" className={`p-4 mb-3 ${className}`}>
      <View className="flex-row items-center justify-between mb-2.5">
        <AppText variant="caption" color="muted">
          {mcq.chapter} {mcq.board ? `• ${mcq.board}` : ''}
        </AppText>
        <Badge
          label={mcq.difficulty.toUpperCase()}
          variant={mcq.difficulty === 'hard' ? 'danger' : 'secondary'}
        />
      </View>

      <AppText variant="bodyLarge" color="primary" className="mb-3 font-semibold leading-5">
        {mcq.banglaQuestion || mcq.question}
      </AppText>

      {/* 4 Options */}
      <View className="gap-2">
        {mcq.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === mcq.correctIndex;
          const showAnswer = selectedIndex !== null && selectedIndex !== undefined;

          let bg = theme.colors.surfaceElevated;
          let border = theme.colors.border;
          let textColor = theme.colors.textPrimary;

          if (showAnswer) {
            if (isCorrect) {
              bg = 'rgba(16, 185, 129, 0.15)';
              border = '#10B981';
              textColor = '#10B981';
            } else if (isSelected && !isCorrect) {
              bg = 'rgba(244, 63, 94, 0.15)';
              border = '#F43F5E';
              textColor = '#F43F5E';
            }
          } else if (isSelected) {
            bg = 'rgba(87, 224, 183, 0.15)';
            border = theme.colors.primary;
          }

          return (
            <Pressable
              key={index}
              disabled={showAnswer}
              onPress={() => onSelectOption?.(index)}
              style={{
                backgroundColor: bg,
                borderColor: border,
                borderWidth: 1,
                borderRadius: theme.radius.lg,
                paddingVertical: 10,
                paddingHorizontal: 12,
              }}
              className="flex-row items-center gap-3 active:opacity-75"
            >
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: theme.radius.full,
                  width: 24,
                  height: 24,
                }}
                className="items-center justify-center"
              >
                <AppText variant="caption" style={{ color: textColor, fontWeight: '700' }}>
                  {['A', 'B', 'C', 'D'][index]}
                </AppText>
              </View>
              <AppText variant="bodySmall" style={{ color: textColor, flex: 1 }}>
                {option}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {/* Collapsible Explanation */}
      {showExplanation && mcq.explanation && (
        <View
          style={{
            backgroundColor: 'rgba(108, 183, 255, 0.10)',
            borderColor: 'rgba(108, 183, 255, 0.25)',
            borderWidth: 1,
            borderRadius: theme.radius.md,
            padding: 10,
          }}
          className="mt-3"
        >
          <AppText variant="caption" color="sky" className="font-bold mb-1">
            Derivation & Explanation
          </AppText>
          <AppText variant="bodySmall" color="secondary" className="leading-5">
            {mcq.explanation}
          </AppText>
        </View>
      )}
    </Card>
  );
}

export function ContentCountCard({
  count,
  label,
  icon,
  accentColor = '#57E0B7',
}: {
  count: number | string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
}) {
  const theme = useTheme();

  return (
    <Card
      variant="flat"
      className="items-center justify-center p-3.5 flex-1 min-w-[100px]"
      style={{
        backgroundColor: theme.colors.surfaceElevated,
      }}
    >
      <View
        style={{
          backgroundColor: `${accentColor}18`,
          borderRadius: theme.radius.full,
          width: 36,
          height: 36,
        }}
        className="items-center justify-center mb-1.5"
      >
        <Ionicons name={icon} size={18} color={accentColor} />
      </View>
      <AppText variant="headlineMedium" color="primary" style={{ fontWeight: '800' }}>
        {String(count)}
      </AppText>
      <AppText variant="caption" color="muted">
        {label}
      </AppText>
    </Card>
  );
}
