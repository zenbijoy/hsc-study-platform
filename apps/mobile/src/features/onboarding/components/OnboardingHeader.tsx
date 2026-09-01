import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';

export function OnboardingHeader({
  currentStepIndex,
  totalSteps,
  onBack,
  canGoBack = true,
}: {
  currentStepIndex: number;
  totalSteps: number;
  onBack?: () => void;
  canGoBack?: boolean;
}) {
  const theme = useTheme();

  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/5">
      <View className="w-10">
        {canGoBack && onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="active:opacity-75"
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>

      {/* Segmented Progress Bar */}
      <View className="flex-row items-center gap-1.5 flex-1 max-w-[180px] mx-4">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          let barColor = 'rgba(255, 255, 255, 0.12)';
          if (isComplete) barColor = theme.colors.primary;
          else if (isCurrent) barColor = 'rgba(87, 224, 183, 0.5)';

          return (
            <View
              key={index}
              style={{ backgroundColor: barColor }}
              className="h-1.5 flex-1 rounded-full"
            />
          );
        })}
      </View>

      <View className="w-10 items-end">
        <AppText variant="caption" color="muted" style={{ fontWeight: '700' }}>
          {currentStepIndex + 1}/{totalSteps}
        </AppText>
      </View>
    </View>
  );
}
