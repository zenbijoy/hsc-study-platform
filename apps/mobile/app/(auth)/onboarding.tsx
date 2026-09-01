import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { AppButton } from '@/src/components/common/AppButton';
import { OnboardingHeader } from '@/src/features/onboarding/components/OnboardingHeader';
import { YearStep } from '@/src/features/onboarding/components/YearStep';
import { GroupStep } from '@/src/features/onboarding/components/GroupStep';
import { BoardStep } from '@/src/features/onboarding/components/BoardStep';
import { SubjectsStep } from '@/src/features/onboarding/components/SubjectsStep';
import { PreferencesStep } from '@/src/features/onboarding/components/PreferencesStep';
import { ReviewStep } from '@/src/features/onboarding/components/ReviewStep';
import { useOnboardingState } from '@/src/features/onboarding/hooks/useOnboardingState';

export default function OnboardingScreen() {
  const theme = useTheme();
  const {
    stepIndex,
    totalSteps,
    currentStep,
    draft,
    studentName,
    isSaving,
    saveError,
    isLoaded,
    nextStep,
    prevStep,
    setYear,
    setGroup,
    setBoard,
    toggleSubject,
    toggleFocus,
    setDailyGoal,
    submitOnboarding,
  } = useOnboardingState();

  if (!isLoaded) {
    return <View style={{ backgroundColor: theme.colors.background }} className="flex-1" />;
  }

  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background }} className="flex-1">
      {/* Header with Progress Bar (hidden on Welcome step) */}
      {currentStep !== 'WELCOME' && (
        <OnboardingHeader
          currentStepIndex={stepIndex}
          totalSteps={totalSteps}
          onBack={prevStep}
          canGoBack={stepIndex > 0}
        />
      )}

      <View className="flex-1 px-4">
        {currentStep === 'WELCOME' && (
          <View className="flex-1 justify-between py-12 items-center">
            <View />

            <View className="items-center max-w-sm">
              <View
                style={{
                  backgroundColor: 'rgba(87, 224, 183, 0.12)',
                  borderColor: 'rgba(87, 224, 183, 0.30)',
                  borderWidth: 1,
                  borderRadius: theme.radius['3xl'],
                  width: 80,
                  height: 80,
                }}
                className="items-center justify-center mb-6"
              >
                <Ionicons name="sparkles" size={38} color={theme.colors.primary} />
              </View>

              <AppText variant="headlineLarge" color="primary" align="center" style={{ fontWeight: '800' }}>
                Welcome, {studentName} 👋
              </AppText>
              <AppText variant="bodyMedium" color="muted" align="center" className="mt-2.5 leading-6">
                Let's personalize your HSC study experience. We will use this to show you the right
                textbooks, formulas, and board questions.
              </AppText>
            </View>

            <View className="w-full max-w-sm">
              <AppButton onPress={nextStep} variant="primary" className="w-full">
                Get Started (1 min)
              </AppButton>
            </View>
          </View>
        )}

        {currentStep === 'ACADEMIC_YEAR' && (
          <YearStep selectedYear={draft.hscYear} onSelectYear={setYear} />
        )}

        {currentStep === 'GROUP' && (
          <GroupStep selectedGroup={draft.studentGroup} onSelectGroup={setGroup} />
        )}

        {currentStep === 'BOARD' && (
          <View className="flex-1 justify-between pb-4">
            <BoardStep selectedBoard={draft.board} onSelectBoard={setBoard} />
          </View>
        )}

        {currentStep === 'SUBJECTS' && (
          <View className="flex-1 justify-between pb-4">
            <SubjectsStep
              selectedSubjectIds={draft.preferredSubjectIds}
              onToggleSubject={toggleSubject}
            />
            <View className="max-w-sm w-full self-center">
              <AppButton
                onPress={nextStep}
                disabled={draft.preferredSubjectIds.length === 0}
                variant="primary"
                className="w-full"
              >
                Continue ({draft.preferredSubjectIds.length} Selected)
              </AppButton>
            </View>
          </View>
        )}

        {currentStep === 'PREFERENCES' && (
          <View className="flex-1 justify-between pb-4">
            <PreferencesStep
              selectedFocus={draft.studyFocus}
              onToggleFocus={toggleFocus}
              selectedDailyGoal={draft.dailyGoalMinutes}
              onSelectDailyGoal={setDailyGoal}
            />
            <View className="max-w-sm w-full self-center">
              <AppButton onPress={nextStep} variant="primary" className="w-full">
                Continue to Review
              </AppButton>
            </View>
          </View>
        )}

        {currentStep === 'REVIEW' && (
          <ReviewStep
            draft={draft}
            onComplete={submitOnboarding}
            isSaving={isSaving}
            error={saveError}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
