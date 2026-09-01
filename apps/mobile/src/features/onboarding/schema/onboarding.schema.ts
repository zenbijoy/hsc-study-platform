import { CompleteOnboardingPayload } from '../types/onboarding.types';

export function validateOnboardingPayload(payload: Partial<CompleteOnboardingPayload>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!payload.hscYear || payload.hscYear < 2024 || payload.hscYear > 2035) {
    errors.hscYear = 'Please select a valid HSC batch year.';
  }

  if (!payload.studentGroup) {
    errors.studentGroup = 'Please select your academic group.';
  }

  if (!payload.board) {
    errors.board = 'Please select your education board.';
  }

  if (!payload.preferredSubjectIds || payload.preferredSubjectIds.length === 0) {
    errors.preferredSubjectIds = 'Please select at least one preferred subject.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
