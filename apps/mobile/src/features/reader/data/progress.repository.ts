import { saveLocalProgress, getLocalProgress } from '@/lib/localDb';
import { saveReadingProgress } from '@/lib/progress';

export async function persistReadingProgress(
  bookId: string,
  page: number,
  totalPages: number
): Promise<void> {
  if (!bookId || page <= 0) return;
  // Local first
  await saveLocalProgress(bookId, page, totalPages);
  // Async background cloud sync
  saveReadingProgress(bookId, page, totalPages).catch(() => {});
}

export async function loadReadingProgress(bookId: string): Promise<number | null> {
  if (!bookId) return null;
  const record = await getLocalProgress(bookId);
  return record ? record.page_number : null;
}
