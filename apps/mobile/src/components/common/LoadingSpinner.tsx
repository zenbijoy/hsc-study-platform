import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingSpinner({
  message,
  size = 'small',
  color = '#57E0B7',
}: LoadingSpinnerProps) {
  return (
    <View className="items-center justify-center py-6">
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="mt-3 text-xs text-white/50 font-semibold">{message}</Text>
      )}
    </View>
  );
}
