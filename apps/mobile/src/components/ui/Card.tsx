import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme';
import { AnimatedPressable } from './AnimatedPressable';

export type CardVariant = 'flat' | 'outlined' | 'elevated' | 'interactive';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
  accessibilityLabel?: string;
}

export function Card({
  children,
  variant = 'outlined',
  onPress,
  style,
  className = '',
  accessibilityLabel,
}: CardProps) {
  const theme = useTheme();

  const variantStyles: Record<CardVariant, ViewStyle> = {
    flat: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.cardPadding,
    },
    outlined: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.cardPadding,
    },
    elevated: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
      padding: theme.spacing.cardPadding,
      ...theme.shadows.low,
    },
    interactive: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.cardPadding,
      ...theme.shadows.low,
    },
  };

  if (variant === 'interactive' && onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[variantStyles.interactive, style]}
        className={className}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[variantStyles[variant], style]} className={className}>
      {children}
    </View>
  );
}
