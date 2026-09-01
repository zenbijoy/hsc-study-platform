import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export const motion = {
  timing: {
    instant: 0,
    fast: 120,
    normal: 220,
    slow: 360,
  },
  spring: {
    gentle: { damping: 20, stiffness: 150, mass: 1 },
    snappy: { damping: 15, stiffness: 220, mass: 0.8 },
    bouncySmall: { damping: 12, stiffness: 200, mass: 0.9 },
  },
  scale: {
    press: 0.985,
    pop: 1.03,
  },
} as const;

export function useReducedMotionPreference(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion
    );
    return () => subscription.remove();
  }, []);

  return reducedMotion;
}
