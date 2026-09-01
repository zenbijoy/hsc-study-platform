import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthScreenShell } from '@/src/features/auth/components/AuthScreenShell';
import { AuthTextField } from '@/src/features/auth/components/AuthTextField';
import { PasswordField } from '@/src/features/auth/components/PasswordField';
import { OAuthButton, AuthFooterLink } from '@/src/features/auth/components/OAuthButton';
import { AppButton } from '@/src/components/common/AppButton';
import { AppText } from '@/src/components/ui/Typography';
import { validateEmail, validatePassword } from '@/src/features/auth/services/authValidation';
import { signInWithEmail } from '@/src/features/auth/services/auth.service';
import { useAuth } from '@/src/providers/AuthProvider';

export default function LoginScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setServerError('');
    setEmailError('');
    setPasswordError('');

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

    setIsSubmitting(true);
    const result = await signInWithEmail(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error || 'Failed to sign in.');
      return;
    }

    await refreshProfile();
    router.replace('/(tabs)');
  };

  return (
    <AuthScreenShell
      title="Welcome Back"
      subtitle="Sign in to sync your reading progress, bookmarks, and formula vault."
    >
      {serverError ? (
        <View className="mb-4 p-3 bg-red-500/15 border border-red-500/25 rounded-xl">
          <AppText variant="bodySmall" color="rose" align="center">
            {serverError}
          </AppText>
        </View>
      ) : null}

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
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) setPasswordError('');
        }}
        error={passwordError}
        autoComplete="current-password"
        textContentType="password"
      />

      <View className="flex-row justify-end mb-5">
        <Pressable
          onPress={() => router.push('/(auth)/forgot-password' as any)}
          hitSlop={8}
          className="active:opacity-75"
        >
          <AppText variant="caption" color="sky">
            Forgot password?
          </AppText>
        </Pressable>
      </View>

      <AppButton
        onPress={handleLogin}
        loading={isSubmitting}
        variant="primary"
        className="w-full mb-4"
      >
        Sign In
      </AppButton>

      <View className="flex-row items-center my-4">
        <View className="flex-1 h-[1px] bg-white/10" />
        <AppText variant="caption" color="muted" className="mx-3">
          OR
        </AppText>
        <View className="flex-1 h-[1px] bg-white/10" />
      </View>

      <OAuthButton
        onPress={() => {
          // Google OAuth trigger
          handleLogin();
        }}
        className="mb-2"
      />

      <AuthFooterLink
        prompt="Don't have an account?"
        linkText="Create account"
        onPress={() => router.push('/(auth)/register' as any)}
      />
    </AuthScreenShell>
  );
}
