import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { useFormulaRevision } from '../hooks/useFormulaRevision';
import { FormulaRevisionCard } from '../components/FormulaRevisionCard';
import { CanonicalFormula } from '../types/formula.types';

export function FormulaRevisionScreen({
  formulas,
  onClose,
}: {
  formulas: CanonicalFormula[];
  onClose: () => void;
}) {
  const theme = useTheme();
  const {
    currentFormula,
    currentIndex,
    totalCount,
    isRevealed,
    isFinished,
    completedCount,
    reveal,
    rateQuality,
    restart,
  } = useFormulaRevision(formulas);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }} className="px-4 pt-4">
      {/* Header */}
      <View className="flex-row items-center justify-between pb-3 border-b border-white/10">
        <View>
          <AppText variant="caption" color="mint" style={{ fontWeight: '800', letterSpacing: 1.5 }}>
            RAPID FLASHCARD DRILL
          </AppText>
          <AppText variant="titleMedium" color="primary" style={{ fontWeight: '800' }}>
            Formula Revision
          </AppText>
        </View>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close revision"
          className="p-2 -mr-2 active:opacity-60"
        >
          <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
        </Pressable>
      </View>

      {/* Main Flashcard Surface */}
      {isFinished ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="checkmark-circle" size={64} color="#57E0B7" />
          <AppText variant="headlineMedium" color="primary" className="mt-4 text-center font-bold">
            Revision Session Complete! 🎉
          </AppText>
          <AppText variant="bodyMedium" color="secondary" className="mt-2 text-center">
            You successfully reviewed {completedCount} formulas.
          </AppText>
          <View className="flex-row gap-3 mt-8 w-full">
            <Pressable
              onPress={restart}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.lg,
                paddingVertical: 14,
              }}
              className="flex-1 items-center justify-center active:opacity-75"
            >
              <AppText variant="labelLarge" color="secondary">
                Restart Session
              </AppText>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.lg,
                paddingVertical: 14,
              }}
              className="flex-1 items-center justify-center active:opacity-85"
            >
              <AppText variant="labelLarge" style={{ color: '#071018', fontWeight: '800' }}>
                Done
              </AppText>
            </Pressable>
          </View>
        </View>
      ) : currentFormula ? (
        <View className="flex-1 justify-center">
          <View className="flex-row items-center justify-between mb-2">
            <AppText variant="caption" color="muted">
              Card {currentIndex + 1} of {totalCount}
            </AppText>
            <AppText variant="caption" color="mint">
              {Math.round(((currentIndex + 1) / totalCount) * 100)}%
            </AppText>
          </View>

          <FormulaRevisionCard
            formula={currentFormula}
            isRevealed={isRevealed}
            onReveal={reveal}
            onRate={rateQuality}
          />
        </View>
      ) : null}
    </View>
  );
}
