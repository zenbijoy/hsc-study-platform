import type { AuthStatus } from '@/src/types/auth.types';

export interface RouteResolutionInput {
  authStatus: AuthStatus;
  isSupabaseConfigured: boolean;
  deepLinkPath?: string;
  hasCompletedOnboarding?: boolean;
}

export function resolveInitialRoute({
  authStatus,
  isSupabaseConfigured,
  deepLinkPath,
}: RouteResolutionInput): string {
  // If not configured (demo mode), allow immediate access to tabs
  if (!isSupabaseConfigured) {
    return deepLinkPath || '/(tabs)';
  }

  switch (authStatus) {
    case 'initializing':
    case 'profile-loading':
      return '/'; // Hold on splash / index

    case 'signed-out':
    case 'error':
      return '/auth';

    case 'onboarding-required':
      // For future onboarding flow or soft gateway
      return '/(tabs)';

    case 'ready':
    default:
      return deepLinkPath || '/(tabs)';
  }
}
