import { ReaderDisplayMode } from '../types/reader.types';

export interface ReaderThemePalette {
  background: string;
  toolbar: string;
  border: string;
  textPrimary: string;
  textMuted: string;
  accent: string;
  pdfFilterColor?: string;
}

export const READER_THEMES: Record<ReaderDisplayMode, ReaderThemePalette> = {
  original: {
    background: '#FFFFFF',
    toolbar: '#0B151E',
    border: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    accent: '#57E0B7',
  },
  sepia: {
    background: '#1C1712',
    toolbar: '#2A221B',
    border: 'rgba(245, 230, 211, 0.15)',
    textPrimary: '#F5E6D3',
    textMuted: 'rgba(245, 230, 211, 0.6)',
    accent: '#FFB86C',
  },
  dark: {
    background: '#05090D',
    toolbar: '#0B151E',
    border: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    accent: '#57E0B7',
  },
  midnight: {
    background: '#081018',
    toolbar: '#0F1E2C',
    border: 'rgba(226, 241, 255, 0.15)',
    textPrimary: '#E2F1FF',
    textMuted: 'rgba(226, 241, 255, 0.6)',
    accent: '#6CB7FF',
  },
};

export function getReaderThemePalette(mode: ReaderDisplayMode): ReaderThemePalette {
  return READER_THEMES[mode] || READER_THEMES.dark;
}
