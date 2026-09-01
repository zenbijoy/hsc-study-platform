export type AnimationKey =
  | 'none'
  | 'fadeIn'
  | 'fadeRise'
  | 'slideUp'
  | 'slideLeft'
  | 'scalePress'
  | 'springPop'
  | 'staggerChildren'
  | 'shimmer'
  | 'progressFill';

export const approvedAnimations: Record<AnimationKey, boolean> = {
  none: true,
  fadeIn: true,
  fadeRise: true,
  slideUp: true,
  slideLeft: true,
  scalePress: true,
  springPop: true,
  staggerChildren: true,
  shimmer: true,
  progressFill: true,
};

export function resolveAnimation(key?: string): AnimationKey {
  if (key && key in approvedAnimations) {
    return key as AnimationKey;
  }
  return 'none';
}
