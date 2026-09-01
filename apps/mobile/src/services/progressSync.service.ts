import { saveReadingProgress } from '@/src/repositories/progress.repository';
import { getDb } from './localDb.service';

let pendingBookId: string | null = null;
let pendingPage: number = 1;
let pendingTotal: number = 1;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Record reading progress locally immediately, then debounce remote sync to avoid network spam.
 */
export async function queueReadingProgress(
  bookId: string,
  pageNumber: number,
  totalPages: number
): Promise<void> {
  pendingBookId = bookId;
  pendingPage = pageNumber;
  pendingTotal = totalPages;

  // 1. Immediate SQLite local update
  try {
    const db = await getDb();
    const percentage = totalPages > 0 ? (pageNumber / totalPages) * 100 : 0;
    await db.runAsync(
      `INSERT INTO reading_progress_queue (book_id, page_number, total_pages, percentage, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, 0)
       ON CONFLICT(book_id) DO UPDATE SET
         page_number = excluded.page_number,
         percentage = excluded.percentage,
         updated_at = excluded.updated_at,
         synced = 0;`,
      [bookId, pageNumber, totalPages, percentage, new Date().toISOString()]
    );
  } catch (err) {
    console.warn('[ProgressSync] Failed local SQLite write:', err);
  }

  // 2. Debounce cloud sync (flush after 3 seconds of inactivity)
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    flushPendingProgress();
  }, 3000);
}

/**
 * Flush any pending progress immediately (e.g. on reader screen unmount or blur).
 */
export async function flushPendingProgress(): Promise<void> {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  if (pendingBookId) {
    const bId = pendingBookId;
    const pNum = pendingPage;
    const tNum = pendingTotal;
    pendingBookId = null;

    await saveReadingProgress(bId, pNum, tNum);
  }
}
