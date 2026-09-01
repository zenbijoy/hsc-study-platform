export type BookCardVariant = 'compact' | 'grid' | 'continue';
export type FormulaCardVariant = 'standard' | 'featured' | 'compact';
export type ChapterCardVariant = 'standard' | 'compact';

export const approvedBookCardVariants: Record<BookCardVariant, boolean> = {
  compact: true,
  grid: true,
  continue: true,
};

export const approvedFormulaCardVariants: Record<FormulaCardVariant, boolean> = {
  standard: true,
  featured: true,
  compact: true,
};

export function resolveBookCardVariant(variant?: string): BookCardVariant {
  if (variant && variant in approvedBookCardVariants) {
    return variant as BookCardVariant;
  }
  return 'grid';
}

export function resolveFormulaCardVariant(variant?: string): FormulaCardVariant {
  if (variant && variant in approvedFormulaCardVariants) {
    return variant as FormulaCardVariant;
  }
  return 'standard';
}
