import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/theme';
import { AppText } from './Typography';

export type ChipVariant =
  | 'neutral'
  | 'primary'
  | 'subject'
  | 'success'
  | 'warning'
  | 'danger';

export interface ChipProps {
  label: string;
  variant?: ChipVariant;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  accentColor?: string;
  className?: string;
}

export function Chip({
  label,
  variant = 'neutral',
  selected = false,
  onPress,
  icon,
  accentColor,
  className = '',
}: ChipProps) {
  const theme = useTheme();

  const getVariantStyles = () => {
    if (selected) {
      return {
        bg: theme.colors.primary,
        border: theme.colors.primary,
        text: theme.colors.primaryForeground,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          bg: 'rgba(87, 224, 183, 0.12)',
          border: 'rgba(87, 224, 183, 0.25)',
          text: theme.colors.primary,
        };
      case 'subject':
        return {
          bg: accentColor ? `${accentColor}18` : 'rgba(108, 183, 255, 0.12)',
          border: accentColor ? `${accentColor}35` : 'rgba(108, 183, 255, 0.25)',
          text: accentColor || theme.colors.secondary,
        };
      case 'success':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.25)',
          text: theme.colors.success,
        };
      case 'warning':
        return {
          bg: 'rgba(251, 191, 36, 0.12)',
          border: 'rgba(251, 191, 36, 0.25)',
          text: theme.colors.warning,
        };
      case 'danger':
        return {
          bg: 'rgba(244, 63, 94, 0.12)',
          border: 'rgba(244, 63, 94, 0.25)',
          text: theme.colors.danger,
        };
      case 'neutral':
      default:
        return {
          bg: theme.colors.surface,
          border: theme.colors.border,
          text: theme.colors.textSecondary,
        };
    }
  };

  const v = getVariantStyles();

  const content = (
    <View
      style={{
        backgroundColor: v.bg,
        borderColor: v.border,
        borderWidth: 1,
        borderRadius: theme.radius.full,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}
      className={`flex-row items-center gap-1.5 ${className}`}
    >
      {icon}
      <AppText
        variant="labelMedium"
        style={{ color: v.text }}
      >
        {label}
      </AppText>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-75">
        {content}
      </Pressable>
    );
  }

  return content;
}

export function Badge({
  label,
  variant = 'primary',
  className = '',
}: {
  label: string | number;
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'neutral';
  className?: string;
}) {
  const theme = useTheme();

  const bgColors: Record<string, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
    neutral: theme.colors.surfaceElevated,
  };

  const textColors: Record<string, string> = {
    primary: theme.colors.primaryForeground,
    secondary: theme.colors.secondaryForeground,
    warning: '#071018',
    danger: '#FFFFFF',
    neutral: theme.colors.textPrimary,
  };

  return (
    <View
      style={{
        backgroundColor: bgColors[variant],
        borderRadius: theme.radius.full,
        paddingHorizontal: 7,
        paddingVertical: 2,
      }}
      className={`items-center justify-center ${className}`}
    >
      <AppText
        variant="caption"
        style={{ color: textColors[variant], fontWeight: '800', fontSize: 10 }}
      >
        {String(label)}
      </AppText>
    </View>
  );
}
