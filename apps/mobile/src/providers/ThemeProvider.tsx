import React, { createContext, useContext } from 'react';
import { useStudyStore, type ReaderTheme } from '@/store/studyStore';

interface ThemeContextValue {
  theme: ReaderTheme;
  setTheme: (theme: ReaderTheme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useStudyStore((state) => state.readerTheme);
  const setTheme = useStudyStore((state) => state.setReaderTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark: theme !== 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
