import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase/client';
import type { AuthStatus, UserProfile } from '@/src/types/auth.types';

interface AuthContextValue {
  status: AuthStatus;
  profile: UserProfile | null;
  isReady: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  status: 'initializing',
  profile: null,
  isReady: false,
  isAuthenticated: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const hydrateSession = async () => {
    if (!isSupabaseConfigured) {
      // In offline / demo mode, enter ready state with demo profile
      setProfile({
        id: 'demo-student',
        fullName: 'HSC Candidate (Demo)',
        isOnboarded: true,
        createdAt: new Date().toISOString(),
      });
      setStatus('ready');
      return;
    }

    try {
      setStatus('initializing');
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        setProfile(null);
        setStatus('signed-out');
        return;
      }

      setStatus('profile-loading');
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      const resolvedProfile: UserProfile = {
        id: session.user.id,
        fullName: userProfile?.full_name || session.user.email?.split('@')[0] || 'Student',
        avatarUrl: userProfile?.avatar_url,
        hscYear: userProfile?.hsc_year,
        board: userProfile?.board,
        studentGroup: userProfile?.student_group,
        isOnboarded: Boolean(userProfile?.hsc_year && userProfile?.student_group),
        createdAt: userProfile?.created_at || new Date().toISOString(),
      };

      setProfile(resolvedProfile);
      setStatus(resolvedProfile.isOnboarded ? 'ready' : 'onboarding-required');
    } catch (err) {
      console.warn('[AuthProvider] Session hydration error:', err);
      setStatus('signed-out');
    }
  };

  useEffect(() => {
    hydrateSession();

    if (!isSupabaseConfigured) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        hydrateSession();
      } else {
        setProfile(null);
        setStatus('signed-out');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setProfile(null);
    setStatus('signed-out');
  };

  const isReady = status === 'ready';
  const isAuthenticated = status === 'ready' || status === 'onboarding-required';

  return (
    <AuthContext.Provider
      value={{
        status,
        profile,
        isReady,
        isAuthenticated,
        signOut,
        refreshProfile: hydrateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
