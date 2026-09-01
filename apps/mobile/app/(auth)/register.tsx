import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthScreenShell } from '@/src/features/auth/components/AuthScreenShell';
import { AuthTextField } from '@/src/features/auth/components/AuthTextField';
import { PasswordField } from '@/src/features/auth/components/PasswordField';
import { AuthFooterLink } from '@/src/features/auth/components/OAuthButton';
import { AppButton } from '@/src/components/common/AppButton';
import { AppText } from '@/src/components/ui/Typography';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateFullName,
  evaluatePasswordStrength,
} from '@/src/features/auth/services/authValidation';
import { signUpWithEmail } from '@/src/features/auth/services/auth.service';
import { useAuth } from '@/src/providers/AuthProvider';

export default function RegisterScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = evaluatePasswordStrength(password);

  const handleRegister = async () => {
    setServerError('');
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');

    const nameCheck = validateFullName(name);
    if (!nameCheck.valid) {
      setNameError(nameCheck.error || '');
      return;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setEmailError(emailCheck.error || '');
      return;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setPasswordError(passwordCheck.error || '');
      return;
    }

    const matchCheck = validatePasswordMatch(password, confirmPassword);
    if (!matchCheck.valid) {
      setConfirmError(matchCheck.error || '');
      return;
    }

    setIsSubmitting(true);
    const result = await signUpWithEmail(name, email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error || 'Failed to create account.');
      return;
    }

    if (result.isConfirmationPending) {
      router.push({
        pathname: '/(auth)/verify-email' as any,
        params: { email: email.trim().toLowerCase() },
      });
      return;
    }

    await refreshProfile();
    router.replace('/(tabs)');
  };

  return (
    <AuthScreenShell
      title="Create Account"
      subtitle="Join thousands of HSC candidates studying with structured academic tools."
    >
      {serverError ? (
        <View className="mb-4 p-3 bg-red-500/15 border border-red-500/25 rounded-xl">
          <AppText variant="bodySmall" color="rose" align="center">
            {serverError}
          </AppText>
        </View>
      ) : null}

      <AuthTextField
        label="Full Name"
        placeholder="e.g. Tanvir Ahmed"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (nameError) setNameError('');
        }}
        error={nameError}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        icon="person-outline"
      />

      <AuthTextField
        label="Email Address"
        placeholder="student@example.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (emailError) setEmailError('');
        }}
        error={emailError}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        icon="mail-outline"
      />

      <PasswordField
        label="Password (min 8 characters)"
        placeholder="••••••••"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) setPasswordError('');
        }}
        error={passwordError}
        autoComplete="new-password"
        textContentType="newPassword"
      />

      {/* Password Strength Indicator */}
      {password.length > 0 && (
        <View className="flex-row items-center gap-1.5 mb-3 -mt-2 ml-1">
          <View
            className={`h-1.5 flex-1 rounded-full ${
              passwordStrength === 'weak'
                ? 'bg-rose-500'
                : passwordStrength === 'good'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />
          <AppText
            variant="caption"
            style={{
              color:
                passwordStrength === 'weak'
                  ? '#F43F5E'
                  : passwordStrength === 'good'
                  ? '#FBBF24'
                  : '#10B981',
              fontSize: 10,
              fontWeight: '700',
            }}
          >
            {passwordStrength.toUpperCase()}
          </AppText>
        </View>
      )}

      <PasswordField
        label="Confirm Password"
        placeholder="••••••••"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (confirmError) setConfirmError('');
        }}
        error={confirmError}
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <AppButton
        onPress={handleRegister}
        loading={isSubmitting}
        variant="primary"
        className="w-full mt-2 mb-4"
      >
        Create Account
      </AppButton>

      <AuthFooterLink
        prompt="Already have an account?"
        linkText="Sign in"
        onPress={() => router.push('/(auth)/login' as any)}
      />
    </AuthScreenShell>
  );
}
