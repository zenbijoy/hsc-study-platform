import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AuthScreenShell } from '@/src/features/auth/components/AuthScreenShell';
import { AppButton } from '@/src/components/common/AppButton';
import { AppText } from '@/src/components/ui/Typography';
import { sendPasswordResetEmail } from '@/src/features/auth/services/auth.service';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email || 'your email';

  const [cooldown, setCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setResendSuccess(false);

    await sendPasswordResetEmail(email);
    setIsResending(false);
    setResendSuccess(true);
    setCooldown(60);
  };

  return (
    <AuthScreenShell
      title="Verify Your Email"
      subtitle={`We sent a confirmation link to ${email}. Please check your inbox and tap the link to complete registration.`}
    >
      <View
        style={{
          backgroundColor: 'rgba(108, 183, 255, 0.15)',
          borderRadius: theme.radius.xxl,
          width: 68,
          height: 68,
        }}
        className="items-center justify-center self-center mb-6"
      >
        <Ionicons name="mail-outline" size={34} color={theme.colors.secondary} />
      </View>

      {resendSuccess && (
        <View className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/25 rounded-xl">
          <AppText variant="bodySmall" color="mint" align="center">
            Verification link re-sent! Check your inbox.
          </AppText>
        </View>
      )}

      <AppButton
        onPress={handleResend}
        loading={isResending}
        disabled={cooldown > 0}
        variant="secondary"
        className="w-full mb-3"
      >
        {cooldown > 0 ? `Resend Email (${cooldown}s)` : 'Resend Verification Email'}
      </AppButton>

      <AppButton
        onPress={() => router.push('/(auth)/login' as any)}
        variant="outline"
        className="w-full"
      >
        Return to Sign In
      </AppButton>
    </AuthScreenShell>
  );
}
