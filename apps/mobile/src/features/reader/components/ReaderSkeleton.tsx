import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AppText } from '@/src/components/ui/Typography';
import type { ReaderThemePalette } from '../utils/readerTheme';

export function ReaderSkeleton({
  palette,
  message = 'Preparing secure reader…',
  currentPage = 1,
  totalPages = 500,
}: {
  palette: ReaderThemePalette;
  message?: string;
  currentPage?: number;
  totalPages?: number;
}) {
  return (
    <View
      style={{
        backgroundColor: palette.background,
        borderColor: palette.border,
        borderWidth: 1,
        borderRadius: 24,
        padding: 24,
      }}
      className="flex-1 items-center justify-center m-4"
    >
      <ActivityIndicator color={palette.accent} size="large" />

      <AppText variant="bodyMedium" color="secondary" className="mt-4 text-center font-medium">
        {message}
      </AppText>

      {/* HSCP Secure Sandbox Info Container */}
      <View
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: 1,
          borderRadius: 18,
          padding: 18,
          width: '100%',
          marginTop: 24,
        }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <AppText variant="caption" color="sky" style={{ fontWeight: '800', letterSpacing: 1.5 }}>
            HSCP SECURE SANDBOX
          </AppText>
          <View
            style={{
              backgroundColor: 'rgba(87, 224, 183, 0.15)',
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <AppText variant="caption" color="mint" style={{ fontWeight: '700' }}>
              AES-256-GCM
            </AppText>
          </View>
        </View>

        <AppText variant="headlineMedium" color="primary" style={{ fontWeight: '800' }}>
          Page {currentPage} of {totalPages}
        </AppText>

        <AppText variant="caption" color="muted" className="mt-1 leading-5">
          Screenshot protection active. Dynamic moving watermark anchored to session.
        </AppText>
      </View>
    </View>
  );
}
