import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/theme';
import { AppText } from './Typography';

export function LinearProgress({
  percentage,
  color,
  height = 6,
  showLabel = false,
  className = '',
}: {
  percentage: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const theme = useTheme();
  const clamped = Math.min(100, Math.max(0, percentage));
  const barColor = color || theme.colors.primary;

  return (
    <View className={`w-full ${className}`}>
      {showLabel && (
        <View className="flex-row justify-between mb-1.5">
          <AppText variant="caption" color="muted">
            Progress
          </AppText>
          <AppText variant="labelMedium" style={{ color: barColor }}>
            {Math.round(clamped)}%
          </AppText>
        </View>
      )}
      <View
        style={{
          height,
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: theme.radius.full,
          overflow: 'hidden',
        }}
        className="w-full"
      >
        <View
          style={{
            height: '100%',
            width: `${clamped}%`,
            backgroundColor: barColor,
            borderRadius: theme.radius.full,
          }}
        />
      </View>
    </View>
  );
}

export function ReadingProgress({
  currentPage,
  totalPages,
  className = '',
}: {
  currentPage: number;
  totalPages: number;
  className?: string;
}) {
  const percentage = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <View className={className}>
      <View className="flex-row items-center justify-between mb-1">
        <AppText variant="caption" color="muted">
          Page {currentPage} of {totalPages}
        </AppText>
        <AppText variant="caption" color="mint">
          {Math.round(percentage)}%
        </AppText>
      </View>
      <LinearProgress percentage={percentage} height={4} />
    </View>
  );
}
