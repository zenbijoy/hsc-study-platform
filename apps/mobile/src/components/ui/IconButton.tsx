import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AnimatedPressable } from './AnimatedPressable';

export interface IconButtonProps {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'plain' | 'surface' | 'filled' | 'tint';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  disabled?: boolean;
  accessibilityLabel: string;
  className?: string;
}

export function IconButton({
  name,
  onPress,
  variant = 'surface',
  size = 'md',
  color,
  disabled = false,
  accessibilityLabel,
  className = '',
}: IconButtonProps) {
  const theme = useTheme();

  const iconSizes = { sm: 18, md: 22, lg: 26 }[size];
  const containerSizes = {
    sm: 'h-9 w-9 min-w-[36px] min-h-[36px]',
    md: 'h-11 w-11 min-w-[44px] min-h-[44px]',
    lg: 'h-13 w-13 min-w-[52px] min-h-[52px]',
  }[size];

  const resolvedColor = color || (variant === 'filled' ? theme.colors.primaryForeground : theme.colors.textPrimary);

  const variantStyles: Record<string, ViewStyle> = {
    plain: { backgroundColor: 'transparent' },
    surface: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filled: {
      backgroundColor: theme.colors.primary,
    },
    tint: {
      backgroundColor: 'rgba(87, 224, 183, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(87, 224, 183, 0.25)',
    },
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`items-center justify-center rounded-2xl ${containerSizes} ${className}`}
      style={variantStyles[variant]}
    >
      <Ionicons name={name} size={iconSizes} color={resolvedColor} />
    </AnimatedPressable>
  );
}
