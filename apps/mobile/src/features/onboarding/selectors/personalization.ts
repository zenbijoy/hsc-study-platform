import type { UserProfile } from '@/src/types/auth.types';

export interface StudentAcademicContext {
  hscYear: number;
  studentGroup: string;
  board: string;
  preferredSubjectIds: string[];
  studyFocus: string[];
  dailyGoalMinutes: number;
  formattedTitle: string;
}

export function getPreferredSubjectIds(profile?: UserProfile | null): string[] {
  if (!profile) return ['physics', 'chemistry', 'mathematics', 'biology', 'ict'];
  const custom = (profile as any).preferred_subjects || (profile as any).preferredSubjectIds;
  if (Array.isArray(custom) && custom.length > 0) {
    return custom;
  }
  return ['physics', 'chemistry', 'mathematics', 'ict'];
}

export function getStudentAcademicContext(profile?: UserProfile | null): StudentAcademicContext {
  const hscYear = profile?.hscYear || 2026;
  const studentGroup = profile?.studentGroup || 'Science';
  const board = profile?.board || 'Dhaka';
  const preferredSubjectIds = getPreferredSubjectIds(profile);
  const studyFocus = (profile as any)?.study_focus || ['textbooks', 'formulas', 'board_cq'];
  const dailyGoalMinutes = (profile as any)?.daily_goal_minutes || 30;

  return {
    hscYear,
    studentGroup,
    board,
    preferredSubjectIds,
    studyFocus,
    dailyGoalMinutes,
    formattedTitle: `HSC '${String(hscYear).slice(-2)} • ${studentGroup} (${board} Board)`,
  };
}
