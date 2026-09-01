export type PasswordStrength = 'weak' | 'good' | 'strong';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, error: 'Email is required.' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  return { valid: true };
}

export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } {
  if (!confirmPassword) {
    return { valid: false, error: 'Please confirm your password.' };
  }
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match.' };
  }
  return { valid: true };
}

export function validateFullName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: 'Your name is required.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Please enter at least 2 characters.' };
  }
  return { valid: true };
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return 'weak';
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);

  if (password.length >= 10 && hasLetters && hasNumbers && hasSymbols) {
    return 'strong';
  }
  if (password.length >= 8 && hasLetters && hasNumbers) {
    return 'good';
  }
  return 'weak';
}
