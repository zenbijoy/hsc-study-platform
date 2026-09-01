import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';

export function CQHero({
  onStartPractice,
}: {
  onStartPractice?: () => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surfaceElevated,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.xxl,
        padding: 18,
      }}
      className="mb-4"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <AppText variant="caption" color="sky" style={{ fontWeight: '800', letterSpacing: 1.5 }}>
            BOARD QUESTION ENGINE
          </AppText>
          <AppText variant="headlineMedium" color="primary" style={{ fontWeight: '800' }}>
            Creative Questions (CQ)
          </AppText>
          <AppText variant="caption" color="muted" className="mt-1">
            NCTB board questions, stimuli, sub-questions, and step-by-step solutions
          </AppText>
        </View>

        {onStartPractice && (
          <Pressable
            onPress={onStartPractice}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.xl,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
            accessibilityRole="button"
            accessibilityLabel="Start CQ Practice"
            className="flex-row items-center gap-1.5 active:opacity-85 shadow-md"
          >
            <Ionicons name="flash" size={16} color="#071018" />
            <AppText variant="caption" style={{ color: '#071018', fontWeight: '800' }}>
              Practice
            </AppText>
          </Pressable>
        )}
      </View>

      <View className="flex-row gap-2 mt-4 pt-3 border-t border-white/5">
        <View className="flex-1 bg-white/[0.03] rounded-xl p-2 items-center">
          <AppText variant="labelLarge" color="sky" style={{ fontWeight: '800' }}>
            12,480+
          </AppText>
          <AppText variant="caption" color="muted">
            Total CQs
          </AppText>
        </View>
        <View className="flex-1 bg-white/[0.03] rounded-xl p-2 items-center">
          <AppText variant="labelLarge" color="mint" style={{ fontWeight: '800' }}>
            2018–2025
          </AppText>
          <AppText variant="caption" color="muted">
            All 9 Boards
          </AppText>
        </View>
        <View className="flex-1 bg-white/[0.03] rounded-xl p-2 items-center">
          <AppText variant="labelLarge" color="rose" style={{ fontWeight: '800' }}>
            100%
          </AppText>
          <AppText variant="caption" color="muted">
            Step Solutions
          </AppText>
        </View>
      </View>
    </View>
  );
}
