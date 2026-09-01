import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import { AppButton } from '@/src/components/common/AppButton';
import { OnboardingDraft } from '../types/onboarding.types';

export function ReviewStep({
  draft,
  onComplete,
  isSaving,
  error,
}: {
  draft: OnboardingDraft;
  onComplete: () => void;
  isSaving: boolean;
  error?: string;
}) {
  const theme = useTheme();

  return (
    <View className="flex-1 justify-between py-4">
      <View>
        <AppText variant="headlineLarge" color="primary" align="center" style={{ fontWeight: '800' }}>
          Almost Ready! 🚀
        </AppText>
        <AppText variant="bodySmall" color="muted" align="center" className="mt-1.5 mb-6">
          Here is your personalized academic profile. You can change these anytime in Profile Settings.
        </AppText>

        <Card variant="elevated" className="p-4 max-w-sm w-full self-center gap-3.5">
          <View className="flex-row items-center justify-between py-1 border-b border-white/5">
            <AppText variant="bodySmall" color="muted">
              Target Batch
            </AppText>
            <AppText variant="labelMedium" color="primary" style={{ fontWeight: '700' }}>
              HSC {draft.hscYear}
            </AppText>
          </View>

          <View className="flex-row items-center justify-between py-1 border-b border-white/5">
            <AppText variant="bodySmall" color="muted">
              Academic Group
            </AppText>
            <AppText variant="labelMedium" color="mint" style={{ fontWeight: '700' }}>
              {draft.studentGroup?.toUpperCase()}
            </AppText>
          </View>

          <View className="flex-row items-center justify-between py-1 border-b border-white/5">
            <AppText variant="bodySmall" color="muted">
              Education Board
            </AppText>
            <AppText variant="labelMedium" color="primary" style={{ fontWeight: '700' }}>
              {draft.board?.toUpperCase()}
            </AppText>
          </View>

          <View className="flex-row items-center justify-between py-1 border-b border-white/5">
            <AppText variant="bodySmall" color="muted">
              Selected Subjects
            </AppText>
            <AppText variant="labelMedium" color="sky" style={{ fontWeight: '700' }}>
              {draft.preferredSubjectIds.length} Subjects
            </AppText>
          </View>

          <View className="flex-row items-center justify-between py-1">
            <AppText variant="bodySmall" color="muted">
              Daily Target
            </AppText>
            <AppText variant="labelMedium" color="primary" style={{ fontWeight: '700' }}>
              {draft.dailyGoalMinutes} min / day
            </AppText>
          </View>
        </Card>

        {error ? (
          <View className="mt-4 p-3 bg-red-500/15 border border-red-500/25 rounded-xl max-w-sm self-center w-full">
            <AppText variant="bodySmall" color="rose" align="center">
              {error}
            </AppText>
          </View>
        ) : null}
      </View>

      <View className="max-w-sm w-full self-center">
        <AppButton
          onPress={onComplete}
          loading={isSaving}
          variant="primary"
          className="w-full"
        >
          Finish Setup & Start Studying
        </AppButton>
      </View>
    </View>
  );
}
