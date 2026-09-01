import { isSupabaseConfigured, supabase } from '@/src/lib/supabase/client';
import { mapAuthError } from './authErrors';

export interface AuthResult {
  success: boolean;
  error?: string;
  isConfirmationPending?: boolean;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();

  if (!isSupabaseConfigured) {
    // Development Demo Mode Login
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: mapAuthError(err) };
  }
}

export async function signUpWithEmail(
  fullName: string,
  email: string,
  password: string
): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();

  if (!isSupabaseConfigured) {
    // Development Demo Mode Sign-up
    return { success: true };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
        },
      },
    });

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    const isConfirmationPending = !data.session && Boolean(data.user);
    return { success: true, isConfirmationPending };
  } catch (err: any) {
    return { success: false, error: mapAuthError(err) };
  }
}

export async function sendPasswordResetEmail(email: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();

  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
    if (error) {
      return { success: false, error: mapAuthError(error) };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: mapAuthError(err) };
  }
}

export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AuthService] Error during Supabase sign out:', err);
    }
  }
}
