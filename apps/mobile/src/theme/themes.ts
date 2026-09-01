import { darkColors, lightColors, SemanticColors } from './colors';
import { gradients } from './gradients';
import { motion } from './motion';
import { radius } from './radius';
import { darkShadows, lightShadows, ShadowLevel } from './shadows';
import { spacing } from './spacing';
import { typographyScale } from './typography';
import { ViewStyle } from 'react-native';

export interface Theme {
  mode: 'dark' | 'light';
  colors: SemanticColors;
  shadows: Record<ShadowLevel, ViewStyle>;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typographyScale;
  gradients: typeof gradients;
  motion: typeof motion;
}

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  shadows: darkShadows,
  spacing,
  radius,
  typography: typographyScale,
  gradients,
  motion,
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  shadows: lightShadows,
  spacing,
  radius,
  typography: typographyScale,
  gradients,
  motion,
};
