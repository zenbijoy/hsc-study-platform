import { useEffect } from 'react';
import { AppState, BackHandler } from 'react-native';

export function useReaderLifecycle(options: {
  onBackground: () => void;
  onBackPressed: () => boolean; // return true if handled
}) {
  const { onBackground, onBackPressed } = options;

  // 1. Flush & protect cache on app background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        onBackground();
      }
    });
    return () => sub.remove();
  }, [onBackground]);

  // 2. Android hardware back button handling with sheet-priority
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      return onBackPressed();
    });
    return () => sub.remove();
  }, [onBackPressed]);
}
