import { subjects as demoSubjects } from '@/data/demo';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase/client';
import { createAppError } from '@/src/types/error.types';
import type { Subject } from '@/src/types/subject.types';

export async function getSubjects(): Promise<Subject[]> {
  if (!isSupabaseConfigured) {
    return demoSubjects;
  }

  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      throw createAppError('SERVER', error.message, 'Unable to load subjects.', error);
    }

    if (!data?.length) {
      return demoSubjects;
    }

    return data.map((s: any) => ({
      id: s.id,
      name: s.name_en,
      banglaName: s.name_bn,
      icon: s.icon ?? 'book-outline',
      accent: s.accent ?? '#6CB7FF',
      bookCount: s.book_count ?? 0,
      progress: 0,
    }));
  } catch (err: any) {
    console.warn('[SubjectsRepository] Fallback to demo subjects:', err?.message);
    return demoSubjects;
  }
}
