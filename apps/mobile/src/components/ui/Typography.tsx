import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { TypographyVariant, typographyScale } from '@/src/theme/typography';
import { useTheme } from '@/src/theme';

export interface AppTextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'mint' | 'sky' | 'amber' | 'rose';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function AppText({
  children,
  variant = 'bodyMedium',
  color = 'primary',
  align = 'left',
  style,
  className = '',
  ...rest
}: AppTextProps) {
  const theme = useTheme();

  const colorMap: Record<string, string> = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    inverse: theme.colors.textInverse,
    mint: theme.colors.primary,
    sky: theme.colors.secondary,
    amber: theme.colors.warning,
    rose: theme.colors.danger,
  };

  const computedStyle: TextStyle = {
    ...typographyScale[variant],
    color: colorMap[color] || theme.colors.textPrimary,
    textAlign: align,
  };

  return (
    <RNText style={[computedStyle, style]} className={className} {...rest}>
      {children}
    </RNText>
  );
}
