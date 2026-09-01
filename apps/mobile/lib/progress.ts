import { getDirtyProgress, markProgressClean, saveLocalProgress } from './localDb';
import { supabase, supabaseConfigured } from './supabase';

export async function saveReadingProgress(bookId: string, page: number, totalPages: number) {
  if (!bookId) return;
  await saveLocalProgress(bookId, page, totalPages);
  if (!supabaseConfigured) return;
  const { data: auth } = await supabase.auth.getSession();
  const userId = auth.session?.user.id;
  if (!userId) return;
  const percentage = totalPages > 0 ? page / totalPages : 0;
  const { error } = await supabase.from('reading_progress').upsert({
    user_id: userId,
    book_id: bookId,
    page_number: page,
    percentage,
    last_read_at: new Date().toISOString(),
  });
  if (!error) await markProgressClean(bookId);
}

export async function syncDirtyProgress() {
  if (!supabaseConfigured) return;
  const { data: auth } = await supabase.auth.getSession();
  const userId = auth.session?.user.id;
  if (!userId) return;
  for (const row of await getDirtyProgress()) {
    const { error } = await supabase.from('reading_progress').upsert({
      user_id: userId,
      book_id: row.book_id,
      page_number: row.page_number,
      percentage: row.percentage,
      last_read_at: row.updated_at,
    });
    if (!error) await markProgressClean(row.book_id);
  }
}
