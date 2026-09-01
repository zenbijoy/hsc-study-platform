import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { AppText } from './Typography';
import { useTheme } from '@/src/theme';

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  className?: string;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  className = '',
}: ButtonProps) {
  const theme = useTheme();

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.md },
    md: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: theme.radius.lg },
    lg: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: theme.radius.xl },
  };

  const variantStyles: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondary: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.border,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ghost: {
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    danger: {
      backgroundColor: 'rgba(255, 107, 107, 0.2)',
      borderColor: '#FF6B6B',
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  const textColorMap: Record<string, 'inverse' | 'primary' | 'muted' | 'rose'> = {
    primary: 'inverse',
    secondary: 'primary',
    outline: 'primary',
    ghost: 'muted',
    danger: 'rose',
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      style={[sizeStyles[size], variantStyles[variant], style]}
      className={className}
    >
      {typeof children === 'string' ? (
        <AppText
          variant={size === 'sm' ? 'labelMedium' : 'labelLarge'}
          color={textColorMap[variant] || 'primary'}
          style={{ fontWeight: '700' }}
        >
          {children}
        </AppText>
      ) : (
        children
      )}
    </AnimatedPressable>
  );
}
