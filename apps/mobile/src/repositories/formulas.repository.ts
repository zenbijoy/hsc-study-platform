import { formulas as demoFormulas } from '@/data/demo';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase/client';
import { createAppError } from '@/src/types/error.types';
import type { Formula } from '@/src/types/formula.types';

export async function getFormulas(): Promise<Formula[]> {
  if (!isSupabaseConfigured) {
    return demoFormulas;
  }

  try {
    const { data, error } = await supabase
      .from('formula_catalog')
      .select('*')
      .order('importance', { ascending: false })
      .limit(200);

    if (error) {
      throw createAppError('SERVER', error.message, 'Unable to load formula vault.', error);
    }

    if (!data?.length) {
      return demoFormulas;
    }

    return data.map((f: any) => ({
      id: f.id,
      subjectId: f.subject_id ?? 'physics',
      chapter: f.chapter_label ?? 'General',
      title: f.title,
      latex: f.latex,
      plain: f.plain_text ?? f.latex,
      importance: f.importance ?? 3,
      uses: f.usage_count ?? 0,
      explanation: f.explanation,
    }));
  } catch (err: any) {
    console.warn('[FormulasRepository] Fallback to demo formulas:', err?.message);
    return demoFormulas;
  }
}
