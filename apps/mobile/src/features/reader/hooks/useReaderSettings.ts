import { useState, useCallback } from 'react';
import type { ReaderSettings, ReaderDisplayMode, ReaderPageDirection, ReaderFitMode } from '../types/reader.types';

export function useReaderSettings(initialSettings?: Partial<ReaderSettings>) {
  const [settings, setSettings] = useState<ReaderSettings>({
    displayMode: initialSettings?.displayMode || 'dark',
    pageDirection: initialSettings?.pageDirection || 'vertical',
    fitMode: initialSettings?.fitMode || 'fit-width',
    brightness: initialSettings?.brightness ?? 1.0,
    keepScreenAwake: initialSettings?.keepScreenAwake ?? false,
    autoHideControls: initialSettings?.autoHideControls ?? true,
  });

  const setDisplayMode = useCallback((mode: ReaderDisplayMode) => {
    setSettings((prev) => ({ ...prev, displayMode: mode }));
  }, []);

  const setPageDirection = useCallback((dir: ReaderPageDirection) => {
    setSettings((prev) => ({ ...prev, pageDirection: dir }));
  }, []);

  const setFitMode = useCallback((fit: ReaderFitMode) => {
    setSettings((prev) => ({ ...prev, fitMode: fit }));
  }, []);

  const setBrightness = useCallback((b: number) => {
    const clamped = Math.max(0.1, Math.min(1.0, b));
    setSettings((prev) => ({ ...prev, brightness: clamped }));
  }, []);

  const setKeepScreenAwake = useCallback((keep: boolean) => {
    setSettings((prev) => ({ ...prev, keepScreenAwake: keep }));
  }, []);

  return {
    settings,
    setDisplayMode,
    setPageDirection,
    setFitMode,
    setBrightness,
    setKeepScreenAwake,
  };
}
