import { validateEnv } from '@/src/config/env';
import { initLocalDatabase } from '@/src/services/localDb.service';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase/client';
import type { AuthStatus, UserProfile } from '@/src/types/auth.types';

export type StartupStage =
  | 'native'
  | 'initializing'
  | 'local-storage'
  | 'database'
  | 'auth'
  | 'profile'
  | 'catalog'
  | 'routing'
  | 'ready'
  | 'error';

export interface StartupContext {
  stage: StartupStage;
  authStatus: AuthStatus;
  userProfile: UserProfile | null;
  initialRoute: string;
  bootTimeMs: number;
  error?: {
    code: 'LOCAL_DATABASE_FAILED' | 'AUTH_RESTORE_FAILED' | 'CRITICAL_CONFIG_INVALID' | 'UNKNOWN';
    message: string;
  };
}

export async function executeStartupSequence(): Promise<StartupContext> {
  const startTs = Date.now();
  let currentStage: StartupStage = 'initializing';

  try {
    // 1. Environment validation
    currentStage = 'local-storage';
    validateEnv();
    if (__DEV__) console.log(`[BOOT] Environment validated in ${Date.now() - startTs}ms`);

    // 2. Local Database & Migrations
    currentStage = 'database';
    const dbStart = Date.now();
    try {
      await initLocalDatabase();
      if (__DEV__) console.log(`[BOOT] SQLite initialized in ${Date.now() - dbStart}ms`);
    } catch (dbErr: any) {
      console.error('[BOOT] SQLite initialization failed:', dbErr);
      return {
        stage: 'error',
        authStatus: 'error',
        userProfile: null,
        initialRoute: '/(tabs)',
        bootTimeMs: Date.now() - startTs,
        error: {
          code: 'LOCAL_DATABASE_FAILED',
          message: 'Unable to initialize local study database. Please try restarting the app.',
        },
      };
    }

    // 3. Auth Restoration
    currentStage = 'auth';
    const authStart = Date.now();
    let authStatus: AuthStatus = 'signed-out';
    let userProfile: UserProfile | null = null;

    if (!isSupabaseConfigured) {
      // Demo mode fallback
      authStatus = 'ready';
      userProfile = {
        id: 'demo-student',
        fullName: 'HSC Candidate (Demo)',
        isOnboarded: true,
        createdAt: new Date().toISOString(),
      };
      if (__DEV__) console.log(`[BOOT] Running in Demo Mode. Auth status: ready (${Date.now() - authStart}ms)`);
    } else {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          currentStage = 'profile';
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const isOnboarded = Boolean(profile?.hsc_year && profile?.student_group);
          userProfile = {
            id: session.user.id,
            fullName: profile?.full_name || session.user.email?.split('@')[0] || 'Student',
            avatarUrl: profile?.avatar_url,
            hscYear: profile?.hsc_year,
            board: profile?.board,
            studentGroup: profile?.student_group,
            isOnboarded,
            createdAt: profile?.created_at || new Date().toISOString(),
          };

          authStatus = isOnboarded ? 'ready' : 'onboarding-required';
        } else {
          authStatus = 'signed-out';
        }
        if (__DEV__) console.log(`[BOOT] Auth resolved in ${Date.now() - authStart}ms (${authStatus})`);
      } catch (authErr) {
        console.warn('[BOOT] Auth restore network error (offline safe):', authErr);
        authStatus = 'signed-out';
      }
    }

    // 4. Initial Route Resolution
    currentStage = 'routing';
    let initialRoute = '/(tabs)';
    if (authStatus === 'signed-out') {
      // For demo mode or unconfigured we allow direct tab browsing, in production we can point to /(auth)/login
      initialRoute = isSupabaseConfigured ? '/auth' : '/(tabs)';
    } else if (authStatus === 'onboarding-required') {
      initialRoute = '/(tabs)'; // Soft gate or /(auth)/onboarding
    } else {
      initialRoute = '/(tabs)';
    }

    const totalTime = Date.now() - startTs;
    if (__DEV__) console.log(`[BOOT] Startup orchestrator complete in ${totalTime}ms => ${initialRoute}`);

    return {
      stage: 'ready',
      authStatus,
      userProfile,
      initialRoute,
      bootTimeMs: totalTime,
    };
  } catch (err: any) {
    console.error('[BOOT] Fatal startup sequence error:', err);
    return {
      stage: 'error',
      authStatus: 'error',
      userProfile: null,
      initialRoute: '/(tabs)',
      bootTimeMs: Date.now() - startTs,
      error: {
        code: 'UNKNOWN',
        message: err?.message || 'An unexpected error occurred during application startup.',
      },
    };
  }
}
