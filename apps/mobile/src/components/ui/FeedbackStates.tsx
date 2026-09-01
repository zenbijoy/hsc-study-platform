import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from './Typography';
import { AppButton } from '../common/AppButton';

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View className={`items-center justify-center py-12 px-6 ${className}`}>
      <View
        style={{
          backgroundColor: theme.colors.surfaceElevated,
          borderRadius: theme.radius.full,
          width: 64,
          height: 64,
        }}
        className="items-center justify-center mb-4"
      >
        <Ionicons name={icon} size={30} color={theme.colors.textMuted} />
      </View>
      <AppText variant="titleMedium" color="primary" align="center">
        {title}
      </AppText>
      {description && (
        <AppText
          variant="bodySmall"
          color="muted"
          align="center"
          className="mt-1.5 max-w-[260px] leading-5"
        >
          {description}
        </AppText>
      )}
      {actionLabel && onAction && (
        <AppButton onPress={onAction} variant="outline" className="mt-5">
          {actionLabel}
        </AppButton>
      )}
    </View>
  );
}

export function InlineError({
  message,
  onRetry,
  className = '',
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: 'rgba(244, 63, 94, 0.10)',
        borderColor: 'rgba(244, 63, 94, 0.25)',
        borderWidth: 1,
        borderRadius: theme.radius.lg,
        padding: 12,
      }}
      className={`flex-row items-center justify-between ${className}`}
    >
      <View className="flex-row items-center flex-1 gap-2.5 mr-2">
        <Ionicons name="alert-circle" size={20} color={theme.colors.danger} />
        <AppText variant="bodySmall" color="rose" className="flex-1">
          {message}
        </AppText>
      </View>
      {onRetry && (
        <AppButton onPress={onRetry} variant="outline" className="py-1 px-3">
          Retry
        </AppButton>
      )}
    </View>
  );
}

export function FullScreenError({
  title = 'Unable to Load Content',
  message = 'Please check your connection and try again.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center p-6 bg-[#071018]">
      <View className="h-16 w-16 rounded-3xl bg-rose-500/15 items-center justify-center mb-4">
        <Ionicons name="cloud-offline-outline" size={32} color="#F43F5E" />
      </View>
      <AppText variant="headlineMedium" color="primary" align="center">
        {title}
      </AppText>
      <AppText variant="bodyMedium" color="muted" align="center" className="mt-2 max-w-xs leading-5">
        {message}
      </AppText>
      {onRetry && (
        <AppButton onPress={onRetry} variant="primary" className="mt-6 px-8">
          Try Again
        </AppButton>
      )}
    </View>
  );
}
