import { validateEnv } from '@/src/config/env';
import { initLocalDatabase } from '@/src/services/localDb.service';

export interface StartupResult {
  success: boolean;
  bootTimeMs: number;
  warnings: string[];
}

export async function runStartupSequence(): Promise<StartupResult> {
  const startTime = Date.now();
  const warnings: string[] = [];

  try {
    // 1. Validate Environment
    const envCheck = validateEnv();
    if (envCheck.warnings.length) {
      warnings.push(...envCheck.warnings);
    }
    const envTime = Date.now() - startTime;
    if (__DEV__) {
      console.log(`[BOOT] Environment validated in ${envTime}ms (Demo: ${envCheck.warnings.length > 0})`);
    }

    // 2. Initialize Local SQLite Database
    const dbStartTime = Date.now();
    await initLocalDatabase();
    const dbTime = Date.now() - dbStartTime;
    if (__DEV__) {
      console.log(`[BOOT] SQLite database initialized in ${dbTime}ms`);
    }

    const totalTime = Date.now() - startTime;
    if (__DEV__) {
      console.log(`[BOOT] Startup orchestrator completed in ${totalTime}ms`);
    }

    return {
      success: true,
      bootTimeMs: totalTime,
      warnings,
    };
  } catch (error: any) {
    console.error('[BOOT] Startup sequence failure:', error);
    return {
      success: false,
      bootTimeMs: Date.now() - startTime,
      warnings: [error?.message || 'Startup failed'],
    };
  }
}
