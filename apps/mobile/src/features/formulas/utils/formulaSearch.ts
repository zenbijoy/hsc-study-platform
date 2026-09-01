import { CanonicalFormula } from '../types/formula.types';

export function normalizeFormulaQuery(query: string): string {
  if (!query) return '';
  return query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3');
}

export function matchesFormulaSearch(
  formula: CanonicalFormula,
  normalizedQuery: string
): boolean {
  if (!normalizedQuery) return true;

  const targetText = [
    formula.titleBn,
    formula.titleEn || '',
    formula.latex,
    formula.plainText || '',
    formula.subjectId,
    formula.chapterTitle || '',
    formula.conceptName || '',
    ...formula.tags,
    ...formula.variables.map((v) => `${v.symbol} ${v.meaningBn} ${v.meaningEn || ''}`),
  ]
    .join(' ')
    .toLowerCase();

  const words = normalizedQuery.split(' ');
  return words.every((word) => targetText.includes(word));
}
