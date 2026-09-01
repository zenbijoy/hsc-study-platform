import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/src/components/ui/Typography';
import { Button } from '@/src/components/ui/Button';

export function ReaderErrorState({
  title = 'Unable to Open Textbook',
  message,
  onRetry,
  onBack,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: '#071018',
        padding: 24,
      }}
      className="flex-1 items-center justify-center"
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: 'rgba(255, 107, 107, 0.15)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Ionicons name="alert-circle-outline" size={36} color="#FF6B6B" />
      </View>

      <AppText variant="titleLarge" color="primary" style={{ fontWeight: '800', textAlign: 'center' }}>
        {title}
      </AppText>

      <AppText variant="bodyMedium" color="muted" className="mt-2 text-center leading-6 max-w-xs">
        {message}
      </AppText>

      <View className="flex-row gap-3 mt-6">
        {onBack && (
          <Button variant="outline" size="md" onPress={onBack}>
            Go Back
          </Button>
        )}
        {onRetry && (
          <Button variant="primary" size="md" onPress={onRetry}>
            Try Again
          </Button>
        )}
      </View>
    </View>
  );
}
