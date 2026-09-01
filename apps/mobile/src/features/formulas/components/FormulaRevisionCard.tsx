import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { CanonicalFormula } from '../types/formula.types';

export function FormulaRevisionCard({
  formula,
  isRevealed,
  onReveal,
  onRate,
}: {
  formula: CanonicalFormula;
  isRevealed: boolean;
  onReveal: () => void;
  onRate: (quality: 'know' | 'review_again') => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.xxl,
        padding: 20,
      }}
      className="w-full my-4"
    >
      {/* Front: Equation */}
      <View className="items-center justify-center py-8">
        <AppText variant="caption" color="mint" style={{ fontWeight: '800', letterSpacing: 1.5 }}>
          {formula.subjectId.toUpperCase()} • {formula.chapterTitle}
        </AppText>

        <View
          style={{
            backgroundColor: '#05090D',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            borderRadius: theme.radius.xl,
            paddingVertical: 24,
            paddingHorizontal: 20,
            width: '100%',
          }}
          className="items-center justify-center my-4"
        >
          <AppText
            variant="display"
            style={{ color: '#57E0B7', fontFamily: 'monospace', fontWeight: '800' }}
          >
            {formula.latex}
          </AppText>
        </View>
      </View>

      {/* Back: Revealed Context */}
      {isRevealed ? (
        <View className="border-t border-white/10 pt-4">
          <AppText variant="headlineMedium" color="primary" style={{ fontWeight: '800' }}>
            {formula.titleBn}
          </AppText>

          <AppText variant="bodyMedium" color="secondary" className="mt-1 mb-3">
            {formula.explanationBn || 'এই সমীকরণটি সুষম ত্বরণে চলমান বস্তুর ক্ষেত্রে প্রযোজ্য।'}
          </AppText>

          <View className="flex-row gap-3 mt-4">
            <Pressable
              onPress={() => onRate('review_again')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.lg,
                paddingVertical: 12,
              }}
              accessibilityRole="button"
              accessibilityLabel="Review again"
              className="flex-1 items-center justify-center active:opacity-75"
            >
              <AppText variant="labelLarge" color="secondary">
                Review Again ⏳
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => onRate('know')}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.lg,
                paddingVertical: 12,
              }}
              accessibilityRole="button"
              accessibilityLabel="Know it"
              className="flex-1 items-center justify-center active:opacity-85"
            >
              <AppText variant="labelLarge" style={{ color: '#071018', fontWeight: '800' }}>
                Know It! ✅
              </AppText>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={onReveal}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.lg,
            paddingVertical: 14,
          }}
          accessibilityRole="button"
          accessibilityLabel="Reveal details and variables"
          className="w-full items-center justify-center active:opacity-85"
        >
          <AppText variant="labelLarge" style={{ color: '#071018', fontWeight: '800' }}>
            Reveal Details & Variables
          </AppText>
        </Pressable>
      )}
    </View>
  );
}
