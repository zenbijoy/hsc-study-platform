import { CanonicalCQ } from '../types/cq.types';

export function normalizeCQQuery(query: string): string {
  if (!query) return '';
  return query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/২০২৫/g, '2025')
    .replace(/২০২৪/g, '2024')
    .replace(/২০২৩/g, '2023')
    .replace(/২০২২/g, '2022');
}

export function matchesCQSearch(cq: CanonicalCQ, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;

  const targetText = [
    cq.title,
    cq.stimulus,
    cq.board || '',
    cq.year ? cq.year.toString() : '',
    cq.chapterTitle || '',
    cq.subjectId,
    ...cq.tags,
    ...cq.subQuestions.map((q) => `${q.banglaLetter} ${q.question}`),
  ]
    .join(' ')
    .toLowerCase();

  const words = normalizedQuery.split(' ');
  return words.every((word) => targetText.includes(word));
}
