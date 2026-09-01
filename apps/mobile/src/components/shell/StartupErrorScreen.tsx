import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '../ui/Typography';
import { AppButton } from '../common/AppButton';

export interface StartupErrorScreenProps {
  errorCode?: string;
  errorMessage?: string;
  onRetry: () => void;
  onContinueOffline?: () => void;
  allowOfflineBypass?: boolean;
}

export function StartupErrorScreen({
  errorCode = 'STARTUP_ERROR',
  errorMessage = 'Unable to initialize your study environment.',
  onRetry,
  onContinueOffline,
  allowOfflineBypass = false,
}: StartupErrorScreenProps) {
  const theme = useTheme();

  return (
    <View
      style={{ backgroundColor: theme.colors.background }}
      className="flex-1 items-center justify-between py-16 px-6"
    >
      <View />

      <View className="items-center max-w-xs">
        <View
          style={{
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            borderRadius: theme.radius['3xl'],
            width: 72,
            height: 72,
          }}
          className="items-center justify-center mb-5"
        >
          <Ionicons name="alert-circle" size={36} color={theme.colors.danger} />
        </View>

        <AppText variant="headlineMedium" color="primary" align="center">
          Startup Interrupted
        </AppText>
        <AppText variant="bodySmall" color="muted" align="center" className="mt-2 leading-5">
          {errorMessage}
        </AppText>
        <AppText variant="caption" color="muted" align="center" className="mt-3 font-mono">
          [{errorCode}]
        </AppText>
      </View>

      <View className="w-full gap-3">
        <AppButton onPress={onRetry} variant="primary" className="w-full">
          Retry Startup
        </AppButton>
        {allowOfflineBypass && onContinueOffline && (
          <AppButton onPress={onContinueOffline} variant="outline" className="w-full">
            Continue in Offline Mode
          </AppButton>
        )}
      </View>
    </View>
  );
}
