import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AuthScreenShell } from '@/src/features/auth/components/AuthScreenShell';
import { AuthTextField } from '@/src/features/auth/components/AuthTextField';
import { AuthFooterLink } from '@/src/features/auth/components/OAuthButton';
import { AppButton } from '@/src/components/common/AppButton';
import { AppText } from '@/src/components/ui/Typography';
import { validateEmail } from '@/src/features/auth/services/authValidation';
import { sendPasswordResetEmail } from '@/src/features/auth/services/auth.service';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async () => {
    setServerError('');
    setEmailError('');

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setEmailError(emailCheck.error || '');
      return;
    }

    setIsSubmitting(true);
    const result = await sendPasswordResetEmail(email);
    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error || 'Failed to send recovery email.');
      return;
    }

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <AuthScreenShell
        title="Check Your Inbox"
        subtitle={`We sent a password reset link to ${email}. Follow the instructions to reset your password.`}
      >
        <View
          style={{
            backgroundColor: 'rgba(87, 224, 183, 0.15)',
            borderRadius: theme.radius.xxl,
            width: 64,
            height: 64,
          }}
          className="items-center justify-center self-center mb-6"
        >
          <Ionicons name="mail-unread-outline" size={32} color={theme.colors.primary} />
        </View>

        <AppButton
          onPress={() => router.push('/(auth)/login' as any)}
          variant="primary"
          className="w-full mb-3"
        >
          Return to Sign In
        </AppButton>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell
      title="Reset Password"
      subtitle="Enter the email associated with your account to receive recovery instructions."
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

      <AppButton
        onPress={handleReset}
        loading={isSubmitting}
        variant="primary"
        className="w-full mt-2 mb-4"
      >
        Send Recovery Link
      </AppButton>

      <AuthFooterLink
        prompt="Remember your password?"
        linkText="Sign in"
        onPress={() => router.push('/(auth)/login' as any)}
      />
    </AuthScreenShell>
  );
}
