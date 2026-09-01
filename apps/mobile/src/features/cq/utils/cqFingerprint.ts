import { CanonicalCQ } from '../types/cq.types';

export function computeCQFingerprint(cq: CanonicalCQ): string {
  const normalizedStem = (cq.stimulus || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const normalizedParts = cq.subQuestions
    .map((p) => `${p.banglaLetter}:${p.question.trim().toLowerCase().replace(/\s+/g, ' ')}`)
    .join('|');

  const raw = `${cq.subjectId}:${cq.board || 'any'}:${cq.year || 0}:${normalizedStem}:${normalizedParts}`;
  
  // Deterministic fast hash for fingerprint matching
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `cq_fp_${Math.abs(hash).toString(16)}`;
}
