import { isSupabaseConfigured, supabase } from '@/src/lib/supabase/client';

export async function saveReadingProgress(
  bookId: string,
  pageNumber: number,
  totalPages: number
): Promise<void> {
  if (!isSupabaseConfigured || !bookId) return;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const percentage = totalPages > 0 ? Math.min(100, Math.round((pageNumber / totalPages) * 100)) : 0;

    await supabase.from('reading_progress').upsert({
      user_id: user.id,
      book_id: bookId,
      page_number: pageNumber,
      percentage,
      last_read_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[ProgressRepository] Failed to sync reading progress:', err);
  }
}
