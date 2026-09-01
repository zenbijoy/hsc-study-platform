/**
 * HSC Study Platform — Raw and Semantic Color Tokens
 */

export const rawColors = {
  // Brand & Core Accents
  mint500: '#57E0B7',
  mint400: '#75E7C5',
  mint600: '#3EC99F',
  sky500: '#6CB7FF',
  sky400: '#8BC6FF',
  sky600: '#4D9FE8',
  violet500: '#A58BFF',
  violet400: '#BBA5FF',
  coral500: '#FF8A76',
  amber500: '#FBBF24',
  amber400: '#FCD34D',
  rose500: '#F43F5E',
  emerald500: '#10B981',

  // Dark AMOLED Palette
  darkBg: '#071018',
  darkSurface: '#0D1822',
  darkSurfaceElevated: '#142332',
  darkSurfaceMuted: '#0A141D',
  darkBorder: 'rgba(255, 255, 255, 0.08)',
  darkBorderSubtle: 'rgba(255, 255, 255, 0.04)',
  darkTextPrimary: '#FFFFFF',
  darkTextSecondary: 'rgba(255, 255, 255, 0.72)',
  darkTextMuted: 'rgba(255, 255, 255, 0.44)',
  darkTextInverse: '#071018',

  // Light Academic Palette
  lightBg: '#F8FAFC',
  lightSurface: '#FFFFFF',
  lightSurfaceElevated: '#F1F5F9',
  lightSurfaceMuted: '#E2E8F0',
  lightBorder: 'rgba(0, 0, 0, 0.08)',
  lightBorderSubtle: 'rgba(0, 0, 0, 0.04)',
  lightTextPrimary: '#0F172A',
  lightTextSecondary: '#475569',
  lightTextMuted: '#94A3B8',
  lightTextInverse: '#FFFFFF',

  // Reader Functional Backgrounds
  readerAmoled: '#050B10',
  readerSepia: '#F4ECD8',
  readerSepiaText: '#433422',
  readerMidnight: '#0B132B',
  readerLight: '#FFFFFF',
};

export interface SemanticColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  border: string;
  borderSubtle: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;

  success: string;
  warning: string;
  danger: string;
  info: string;

  // Domain Accents
  formulaAccent: string;
  cqAccent: string;
  mcqAccent: string;
  streakAccent: string;

  // Reader
  readerBg: string;
  readerToolbar: string;
}

export const darkColors: SemanticColors = {
  background: rawColors.darkBg,
  surface: rawColors.darkSurface,
  surfaceElevated: rawColors.darkSurfaceElevated,
  surfaceMuted: rawColors.darkSurfaceMuted,
  border: rawColors.darkBorder,
  borderSubtle: rawColors.darkBorderSubtle,

  textPrimary: rawColors.darkTextPrimary,
  textSecondary: rawColors.darkTextSecondary,
  textMuted: rawColors.darkTextMuted,
  textInverse: rawColors.darkTextInverse,

  primary: rawColors.mint500,
  primaryForeground: rawColors.darkBg,
  secondary: rawColors.sky500,
  secondaryForeground: rawColors.darkBg,

  success: rawColors.emerald500,
  warning: rawColors.amber500,
  danger: rawColors.rose500,
  info: rawColors.sky500,

  formulaAccent: rawColors.mint500,
  cqAccent: rawColors.sky500,
  mcqAccent: rawColors.violet500,
  streakAccent: rawColors.amber500,

  readerBg: rawColors.readerAmoled,
  readerToolbar: rawColors.darkSurface,
};

export const lightColors: SemanticColors = {
  background: rawColors.lightBg,
  surface: rawColors.lightSurface,
  surfaceElevated: rawColors.lightSurfaceElevated,
  surfaceMuted: rawColors.lightSurfaceMuted,
  border: rawColors.lightBorder,
  borderSubtle: rawColors.lightBorderSubtle,

  textPrimary: rawColors.lightTextPrimary,
  textSecondary: rawColors.lightTextSecondary,
  textMuted: rawColors.lightTextMuted,
  textInverse: rawColors.lightTextInverse,

  primary: rawColors.mint600,
  primaryForeground: '#FFFFFF',
  secondary: rawColors.sky600,
  secondaryForeground: '#FFFFFF',

  success: rawColors.emerald500,
  warning: rawColors.amber500,
  danger: rawColors.rose500,
  info: rawColors.sky600,

  formulaAccent: rawColors.mint600,
  cqAccent: rawColors.sky600,
  mcqAccent: rawColors.violet500,
  streakAccent: rawColors.amber500,

  readerBg: rawColors.readerLight,
  readerToolbar: rawColors.lightSurfaceElevated,
};
