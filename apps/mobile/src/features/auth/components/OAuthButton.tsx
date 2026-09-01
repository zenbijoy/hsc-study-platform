import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';

export function OAuthButton({
  onPress,
  disabled = false,
  loading = false,
  className = '',
}: {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.lg,
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
      className={`flex-row items-center justify-center gap-3 w-full active:opacity-75 ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      <Ionicons name="logo-google" size={18} color="#EA4335" />
      <AppText variant="labelMedium" color="primary">
        Continue with Google
      </AppText>
    </Pressable>
  );
}

export function AuthFooterLink({
  prompt,
  linkText,
  onPress,
  className = '',
}: {
  prompt: string;
  linkText: string;
  onPress: () => void;
  className?: string;
}) {
  return (
    <View className={`flex-row items-center justify-center gap-1.5 mt-6 ${className}`}>
      <AppText variant="bodySmall" color="muted">
        {prompt}
      </AppText>
      <Pressable onPress={onPress} hitSlop={8} className="active:opacity-75">
        <AppText variant="labelMedium" color="mint">
          {linkText}
        </AppText>
      </Pressable>
    </View>
  );
}
