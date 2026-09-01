import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/providers/AuthProvider';
import {
  OnboardingDraft,
  OnboardingStep,
  StudentGroup,
  StudyFocus,
} from '../types/onboarding.types';
import {
  completeOnboardingAtomic,
  loadLocalOnboardingDraft,
  saveLocalOnboardingDraft,
} from '../services/onboarding.service';

const STEPS: OnboardingStep[] = [
  'WELCOME',
  'ACADEMIC_YEAR',
  'GROUP',
  'BOARD',
  'SUBJECTS',
  'PREFERENCES',
  'REVIEW',
];

export function useOnboardingState() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();

  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>({
    step: 'WELCOME',
    hscYear: 2026,
    studentGroup: 'science',
    board: 'dhaka',
    preferredSubjectIds: ['physics', 'chemistry', 'mathematics', 'ict'],
    studyFocus: ['textbooks', 'formulas', 'board_cq'],
    dailyGoalMinutes: 30,
    lastUpdated: new Date().toISOString(),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);

  // Load draft on mount
  useEffect(() => {
    loadLocalOnboardingDraft().then((saved) => {
      setDraft(saved);
      const stepIdx = STEPS.indexOf(saved.step);
      if (stepIdx > 0) setStepIndex(stepIdx);
      setIsLoaded(true);
    });
  }, []);

  // Save draft on change
  const updateDraft = (updater: (prev: OnboardingDraft) => OnboardingDraft) => {
    setDraft((prev) => {
      const next = updater(prev);
      saveLocalOnboardingDraft(next);
      return next;
    });
  };

  const nextStep = () => {
    if (stepIndex < STEPS.length - 1) {
      const nextIdx = stepIndex + 1;
      const nextStepName = STEPS[nextIdx] ?? 'WELCOME';
      setStepIndex(nextIdx);
      updateDraft((d) => ({ ...d, step: nextStepName }));
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      const prevIdx = stepIndex - 1;
      const prevStepName = STEPS[prevIdx] ?? 'WELCOME';
      setStepIndex(prevIdx);
      updateDraft((d) => ({ ...d, step: prevStepName }));
    }
  };

  const handleComplete = async () => {
    setSaveError(undefined);
    setIsSaving(true);

    const result = await completeOnboardingAtomic({
      hscYear: draft.hscYear || 2026,
      studentGroup: draft.studentGroup || 'science',
      board: draft.board || 'dhaka',
      preferredSubjectIds: draft.preferredSubjectIds,
      studyFocus: draft.studyFocus,
      dailyGoalMinutes: draft.dailyGoalMinutes,
    });

    setIsSaving(false);

    if (!result.success) {
      setSaveError(result.error || 'Failed to complete setup.');
      return;
    }

    await refreshProfile();
    router.replace('/(tabs)');
  };

  return {
    stepIndex,
    totalSteps: STEPS.length,
    currentStep: STEPS[stepIndex] || 'WELCOME',
    draft,
    isSaving,
    saveError,
    isLoaded,
    studentName: profile?.fullName || 'Student',
    nextStep,
    prevStep,
    setYear: (year: number) => {
      updateDraft((d) => ({ ...d, hscYear: year }));
      nextStep();
    },
    setGroup: (group: StudentGroup) => {
      updateDraft((d) => ({ ...d, studentGroup: group }));
      nextStep();
    },
    setBoard: (board: string) => {
      updateDraft((d) => ({ ...d, board }));
      nextStep();
    },
    toggleSubject: (subjectId: string) => {
      updateDraft((d) => {
        const exists = d.preferredSubjectIds.includes(subjectId);
        const updated = exists
          ? d.preferredSubjectIds.filter((id) => id !== subjectId)
          : [...d.preferredSubjectIds, subjectId];
        return { ...d, preferredSubjectIds: updated };
      });
    },
    toggleFocus: (focus: StudyFocus) => {
      updateDraft((d) => {
        const exists = d.studyFocus.includes(focus);
        const updated = exists
          ? d.studyFocus.filter((f) => f !== focus)
          : [...d.studyFocus, focus];
        return { ...d, studyFocus: updated };
      });
    },
    setDailyGoal: (minutes: number) => {
      updateDraft((d) => ({ ...d, dailyGoalMinutes: minutes }));
    },
    submitOnboarding: handleComplete,
  };
}
