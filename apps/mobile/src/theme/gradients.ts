export const gradients = {
  primaryHero: ['#236D79', '#1A3358', '#071018'] as const,
  physicsHero: ['#17385E', '#10243C', '#071018'] as const,
  chemistryHero: ['#124438', '#0C2A23', '#071018'] as const,
  mathHero: ['#2E1E5E', '#1D133D', '#071018'] as const,
  biologyHero: ['#4E211A', '#321510', '#071018'] as const,
  formulaGlow: ['#183B36', '#0E2421', '#071018'] as const,
  surfaceCard: ['#142332', '#0D1822'] as const,
  sprintCard: ['#241B4D', '#15112E', '#071018'] as const,
};

export type GradientKey = keyof typeof gradients;

export function resolveGradient(key?: string): readonly [string, string, ...string[]] {
  if (key && key in gradients) {
    return gradients[key as GradientKey];
  }
  return gradients.primaryHero;
}
