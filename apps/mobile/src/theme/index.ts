export * from './colors';
export * from './subjects';
export * from './typography';
export * from './spacing';
export * from './radius';
export * from './shadows';
export * from './gradients';
export * from './motion';
export * from './haptics';
export * from './themes';

import { useStudyStore } from '@/store/studyStore';
import { darkTheme, lightTheme, Theme } from './themes';

export function useTheme(): Theme {
  const readerTheme = useStudyStore((state) => state.readerTheme);
  return readerTheme === 'light' ? lightTheme : darkTheme;
}
