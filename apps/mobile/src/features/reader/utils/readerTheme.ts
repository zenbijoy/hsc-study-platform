import type { ReaderDisplayMode } from '../types/reader.types';

export interface ReaderThemePalette {
  id: ReaderDisplayMode;
  name: string;
  background: string;
  canvasBackground: string;
  toolbar: string;
  border: string;
  textPrimary: string;
  textMuted: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  pdfFilterColor?: string; // Blend overlay color to provide comfortable eye tinting without inverting photos
}

export const READER_THEMES: Record<ReaderDisplayMode, ReaderThemePalette> = {
  original: {
    id: 'original',
    name: 'Original (Day)',
    background: '#090E14',
    canvasBackground: '#FFFFFF',
    toolbar: 'rgba(11, 21, 30, 0.94)',
    border: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    accent: '#57E0B7',
    badgeBg: 'rgba(255, 255, 255, 0.1)',
    badgeText: '#FFFFFF',
  },
  sepia: {
    id: 'sepia',
    name: 'Sepia (Warm Paper)',
    background: '#181410',
    canvasBackground: '#F6EFE6',
    toolbar: 'rgba(38, 30, 24, 0.94)',
    border: 'rgba(245, 230, 211, 0.18)',
    textPrimary: '#F5E6D3',
    textMuted: 'rgba(245, 230, 211, 0.65)',
    accent: '#FFB86C',
    badgeBg: 'rgba(255, 184, 108, 0.18)',
    badgeText: '#FFB86C',
    pdfFilterColor: 'rgba(244, 235, 220, 0.15)',
  },
  dark: {
    id: 'dark',
    name: 'Dark (AMOLED)',
    background: '#04070A',
    canvasBackground: '#121922',
    toolbar: 'rgba(11, 21, 30, 0.94)',
    border: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    accent: '#57E0B7',
    badgeBg: 'rgba(87, 224, 183, 0.18)',
    badgeText: '#57E0B7',
    pdfFilterColor: 'rgba(0, 0, 0, 0.35)',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight (Deep Blue)',
    background: '#050B12',
    canvasBackground: '#0B1520',
    toolbar: 'rgba(15, 30, 44, 0.94)',
    border: 'rgba(226, 241, 255, 0.16)',
    textPrimary: '#E2F1FF',
    textMuted: 'rgba(226, 241, 255, 0.65)',
    accent: '#6CB7FF',
    badgeBg: 'rgba(108, 183, 255, 0.18)',
    badgeText: '#6CB7FF',
    pdfFilterColor: 'rgba(11, 22, 34, 0.4)',
  },
};

export function getReaderThemePalette(mode: ReaderDisplayMode): ReaderThemePalette {
  return READER_THEMES[mode] || READER_THEMES.dark;
}
