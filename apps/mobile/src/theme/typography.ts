import { TextStyle } from 'react-native';

export type TypographyVariant =
  | 'display'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'titleLarge'
  | 'titleMedium'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'caption';

export const typographyScale: Record<TypographyVariant, TextStyle> = {
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headlineLarge: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headlineMedium: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  titleLarge: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  bodyLarge: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
};
