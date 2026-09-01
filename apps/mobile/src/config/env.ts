/**
 * Centralized Mobile Environment Configuration
 * 
 * Explicitly maps `process.env.EXPO_PUBLIC_*` variables to preserve
 * Expo static replacement during compilation.
 */

export interface MobileEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  licenseFunctionUrl: string;
  isDemoMode: boolean;
  isConfigured: boolean;
}

const rawSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const rawSupabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';
const rawLicenseUrl = process.env.EXPO_PUBLIC_LICENSE_FUNCTION_URL?.trim() ?? '';
const rawDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE?.trim().toLowerCase();

const isConfigured = Boolean(rawSupabaseUrl && rawSupabaseKey);
const isDemoMode = rawDemoMode === 'true' || !isConfigured;

export const env: MobileEnv = {
  supabaseUrl: rawSupabaseUrl || (isDemoMode ? 'https://demo.invalid.supabase.co' : ''),
  supabaseAnonKey: rawSupabaseKey || (isDemoMode ? 'demo-publishable-key' : ''),
  licenseFunctionUrl: rawLicenseUrl || (rawSupabaseUrl ? `${rawSupabaseUrl}/functions/v1/book-license` : ''),
  isDemoMode,
  isConfigured,
};

export function validateEnv(): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  if (!isConfigured) {
    warnings.push('Supabase credentials not configured. Running in offline demo mode.');
  }
  return {
    valid: true,
    warnings,
  };
}
