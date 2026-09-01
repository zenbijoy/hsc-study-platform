const REPETITION_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60];

export function computeNextReviewDate(
  currentStage: number,
  qualityRating: 'know' | 'review_again'
): { nextStage: number; nextReviewAt: string } {
  const now = new Date();

  if (qualityRating === 'review_again') {
    // Reset to stage 0 (1 day)
    const nextDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    return {
      nextStage: 0,
      nextReviewAt: nextDate.toISOString(),
    };
  }

  // Advance stage
  const nextStage = Math.min(currentStage + 1, REPETITION_INTERVALS_DAYS.length - 1);
  const daysToAdd = REPETITION_INTERVALS_DAYS[nextStage] || 7;
  const nextDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  return {
    nextStage,
    nextReviewAt: nextDate.toISOString(),
  };
}
