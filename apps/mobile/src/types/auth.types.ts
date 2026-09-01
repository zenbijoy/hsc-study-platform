export type AuthStatus =
  | 'initializing'
  | 'signed-out'
  | 'profile-loading'
  | 'onboarding-required'
  | 'ready'
  | 'error';

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  hscYear?: number;
  board?: string;
  studentGroup?: 'science' | 'humanities' | 'business_studies';
  isOnboarded: boolean;
  createdAt: string;
}

export interface UserSession {
  userId: string;
  email?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}
