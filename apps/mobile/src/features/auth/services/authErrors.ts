/**
 * Supabase Auth Error Normalization
 * 
 * Maps raw backend/network error messages into friendly, student-focused explanations.
 */

export function mapAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const msg = (error.message || error.error_description || String(error)).toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Email or password is incorrect. Please check and try again.';
  }

  if (msg.includes('user already registered') || msg.includes('email already in use')) {
    return 'An account already exists with this email address. Please sign in.';
  }

  if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
    return 'Please check your email and verify your account before signing in.';
  }

  if (msg.includes('over_email_send_rate_limit') || msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many requests. Please wait a minute before trying again.';
  }

  if (msg.includes('password should be at least') || msg.includes('weak_password')) {
    return 'Password must be at least 8 characters long.';
  }

  if (msg.includes('network') || msg.includes('fetch failed') || msg.includes('failed to fetch')) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }

  return error.message || 'We could not complete your request. Please try again.';
}
