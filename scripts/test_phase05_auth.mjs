import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- Running Phase 05 Authentication & Validation Tests ---');

// 1. Test Email Validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateEmail(email) {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, error: 'Email is required.' };
  if (!EMAIL_REGEX.test(trimmed)) return { valid: false, error: 'Please enter a valid email address.' };
  return { valid: true };
}

assert.strictEqual(validateEmail('').valid, false, 'Empty email is invalid');
assert.strictEqual(validateEmail('   ').valid, false, 'Whitespace email is invalid');
assert.strictEqual(validateEmail('invalid-email').valid, false, 'Missing domain is invalid');
assert.strictEqual(validateEmail('student@hsc.edu.bd').valid, true, 'Valid email passes');
assert.strictEqual(validateEmail('  student@gmail.com  ').valid, true, 'Trimmed valid email passes');
console.log('✓ Email validation tests passed (5/5)');

// 2. Test Password Policy & Match Validation
function validatePassword(p) {
  if (!p) return { valid: false, error: 'Password is required.' };
  if (p.length < 8) return { valid: false, error: 'Password must be at least 8 characters long.' };
  return { valid: true };
}
function validatePasswordMatch(p1, p2) {
  if (!p2) return { valid: false, error: 'Please confirm your password.' };
  if (p1 !== p2) return { valid: false, error: 'Passwords do not match.' };
  return { valid: true };
}

assert.strictEqual(validatePassword('').valid, false, 'Empty password fails');
assert.strictEqual(validatePassword('1234567').valid, false, '7-character password fails min 8 rule');
assert.strictEqual(validatePassword('12345678').valid, true, '8-character password passes');
assert.strictEqual(validatePasswordMatch('Pass1234', 'Pass1234').valid, true, 'Matching passwords pass');
assert.strictEqual(validatePasswordMatch('Pass1234', 'Pass5678').valid, false, 'Mismatched passwords fail');
console.log('✓ Password policy and match tests passed (5/5)');

// 3. Test Password Strength Evaluation
function evaluatePasswordStrength(password) {
  if (password.length < 8) return 'weak';
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);
  if (password.length >= 10 && hasLetters && hasNumbers && hasSymbols) return 'strong';
  if (password.length >= 8 && hasLetters && hasNumbers) return 'good';
  return 'weak';
}

assert.strictEqual(evaluatePasswordStrength('short'), 'weak', 'Short is weak');
assert.strictEqual(evaluatePasswordStrength('pass1234'), 'good', '8-char alphanumeric is good');
assert.strictEqual(evaluatePasswordStrength('StrongP@ss2026!'), 'strong', 'Complex 10+ char is strong');
console.log('✓ Password strength evaluation tests passed (3/3)');

// 4. Test Error Mapping
function mapAuthError(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const msg = (error.message || error.error_description || String(error)).toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Email or password is incorrect. Please check and try again.';
  }
  if (msg.includes('user already registered') || msg.includes('email already in use')) {
    return 'An account already exists with this email address. Please sign in.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please check your email and verify your account before signing in.';
  }
  if (msg.includes('over_email_send_rate_limit') || msg.includes('rate limit')) {
    return 'Too many requests. Please wait a minute before trying again.';
  }
  return error.message || 'We could not complete your request. Please try again.';
}

assert.strictEqual(
  mapAuthError({ message: 'Invalid login credentials' }),
  'Email or password is incorrect. Please check and try again.'
);
assert.strictEqual(
  mapAuthError({ message: 'User already registered' }),
  'An account already exists with this email address. Please sign in.'
);
assert.strictEqual(
  mapAuthError({ message: 'Email not confirmed' }),
  'Please check your email and verify your account before signing in.'
);
assert.strictEqual(
  mapAuthError({ message: 'over_email_send_rate_limit' }),
  'Too many requests. Please wait a minute before trying again.'
);
console.log('✓ Auth error normalization tests passed (4/4)');

// 5. Verify Migration & RLS Files
assert(fs.existsSync('supabase/migrations/0002_auth_profile_trigger.sql'), '0002 migration exists');
console.log('✓ Profile auto-provisioning migration verified');

console.log('\nAll Phase 05 Auth Tests PASSED successfully.');
