import { isSupabaseConfigured, supabase } from '@/src/lib/supabase/client';
import { runInTransaction } from '@/src/services/localDb.service';
import {
  CompleteOnboardingPayload,
  OnboardingDraft,
} from '../types/onboarding.types';

const INITIAL_DRAFT: OnboardingDraft = {
  step: 'WELCOME',
  hscYear: 2026,
  studentGroup: 'science',
  board: 'dhaka',
  preferredSubjectIds: ['physics', 'chemistry', 'mathematics', 'ict'],
  studyFocus: ['textbooks', 'formulas', 'board_cq'],
  dailyGoalMinutes: 30,
  lastUpdated: new Date().toISOString(),
};

export async function saveLocalOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  try {
    await runInTransaction(async (db) => {
      const payloadStr = JSON.stringify(draft);
      await db.runAsync(
        `INSERT INTO cached_content (id, content_type, payload, updated_at)
         VALUES ('onboarding_draft', 'system_draft', ?, ?)
         ON CONFLICT (id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`,
        [payloadStr, Date.now()]
      );
    });
  } catch (err) {
    console.warn('[OnboardingService] Failed to save draft to SQLite:', err);
  }
}

export async function loadLocalOnboardingDraft(): Promise<OnboardingDraft> {
  try {
    const res = await runInTransaction(async (db) => {
      const row = await db.getFirstAsync<{ payload: string }>(
        `SELECT payload FROM cached_content WHERE id = 'onboarding_draft'`
      );
      return row ? JSON.parse(row.payload) : null;
    });

    if (res) return res as OnboardingDraft;
  } catch (err) {
    console.warn('[OnboardingService] Failed to load draft from SQLite:', err);
  }
  return INITIAL_DRAFT;
}

export async function clearLocalOnboardingDraft(): Promise<void> {
  try {
    await runInTransaction(async (db) => {
      await db.runAsync(`DELETE FROM cached_content WHERE id = 'onboarding_draft'`);
    });
  } catch (err) {
    console.warn('[OnboardingService] Failed to clear draft from SQLite:', err);
  }
}

export async function completeOnboardingAtomic(
  payload: CompleteOnboardingPayload
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    // Demo Mode Success
    await clearLocalOnboardingDraft();
    return { success: true };
  }

  try {
    const { error } = await supabase.rpc('complete_onboarding_atomic', {
      p_hsc_year: payload.hscYear,
      p_student_group: payload.studentGroup,
      p_board: payload.board,
      p_preferred_subjects: payload.preferredSubjectIds,
      p_study_focus: payload.studyFocus,
      p_daily_goal_minutes: payload.dailyGoalMinutes,
    });

    if (error) {
      console.error('[OnboardingService] RPC complete_onboarding_atomic failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to complete onboarding on server. Please try again.',
      };
    }

    await clearLocalOnboardingDraft();
    return { success: true };
  } catch (err: any) {
    console.error('[OnboardingService] Network error during onboarding save:', err);
    return {
      success: false,
      error: 'Network connection issue. Your selections are saved locally on this device.',
    };
  }
}
