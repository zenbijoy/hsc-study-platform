import { useEffect } from 'react';
import * as ScreenCapture from 'expo-screen-capture';

/**
 * Hook to block screenshots and screen recording while on a secure reader screen.
 * Automatically lifts protection upon unmounting the screen.
 */
export function useProtectedReaderScreen(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    ScreenCapture.preventScreenCaptureAsync().catch((err) => {
      console.warn('[ScreenCapture] Protection activation failed:', err);
    });

    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch((err) => {
        console.warn('[ScreenCapture] Protection release failed:', err);
      });
    };
  }, [enabled]);
}
