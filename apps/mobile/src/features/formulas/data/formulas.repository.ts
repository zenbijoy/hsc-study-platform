import { bengaliFormulasFixture } from '@/src/fixtures/bengaliFixtures';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase/client';
import { CanonicalFormula } from '../types/formula.types';

export async function fetchFormulaCatalog(): Promise<CanonicalFormula[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('formula_catalog')
        .select('*')
        .eq('is_published', true)
        .order('importance', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          subjectId: item.subject_id,
          subjectName: item.subject_id === 'physics' ? 'Physics' : item.subject_id === 'chemistry' ? 'Chemistry' : 'Higher Math',
          chapterTitle: item.chapter_label || 'Chapter 1',
          titleBn: item.title,
          titleEn: item.title,
          latex: item.latex,
          plainText: item.plain_text,
          importance: item.importance,
          usageCount: item.usage_count,
          tags: ['formula', item.subject_id],
          variables: [
            { symbol: 'v', meaningBn: 'শেষ বেগ', unit: 'm/s' },
            { symbol: 'u', meaningBn: 'আদি বেগ', unit: 'm/s' },
            { symbol: 'a', meaningBn: 'ত্বরণ', unit: 'm/s²' },
            { symbol: 't', meaningBn: 'সময়', unit: 's' },
          ],
          units: { siUnit: 'm/s', dimension: '[LT⁻¹]' },
          conditions: ['সুষম ত্বরণ প্রযোজ্য (Constant Acceleration)'],
          version: 1,
          knowledgeLinks: {
            relatedConcepts: ['গতিবিদ্যা (Kinematics)', 'নিউটনের গতিসূত্র'],
            relatedFormulas: [
              { id: 'f2', title: 'গতির দ্বিতীয় সমীকরণ', latex: 's = ut + \\frac{1}{2}at^2' },
              { id: 'f3', title: 'গতির তৃতীয় সমীকরণ', latex: 'v^2 = u^2 + 2as' },
            ],
            bookReferences: [
              {
                bookId: 'phys-1st',
                bookTitle: 'পদার্থবিজ্ঞান প্রথম পত্র (NCTB)',
                pageNumber: 147,
                chapterTitle: 'নিউটনীয় বলবিদ্যা',
              },
            ],
            cqCount: 17,
            mcqCount: 34,
          },
        }));
      }
    } catch {
      // Fallback to local fixtures
    }
  }

  // Map local fixtures to CanonicalFormula
  return bengaliFormulasFixture.map((f, idx) => ({
    id: f.id || `formula-${idx}`,
    subjectId: f.subjectId,
    subjectName: f.subjectId === 'physics' ? 'Physics' : f.subjectId === 'chemistry' ? 'Chemistry' : 'Higher Math',
    chapterNumber: 4,
    chapterTitle: f.chapter || 'নিউটনীয় বলবিদ্যা (Newtonian Mechanics)',
    conceptName: 'গতির সমীকরণ (Equations of Motion)',
    titleBn: f.title,
    titleEn: f.title,
    latex: f.latex,
    plainText: f.plain || f.latex,
    explanationBn: f.explanation || 'এই সমীকরণটি সুষম ত্বরণে চলমান বস্তুর ক্ষেত্রে প্রযোজ্য।',
    explanationEn: 'This equation applies to objects moving under constant acceleration.',
    variables: (f.variables || []).map((v) => ({
      symbol: v.symbol,
      meaningBn: v.name,
      unit: v.unit,
    })),
    units: { siUnit: 'm/s', dimension: '[LT⁻¹]' },
    conditions: ['সুষম ত্বরণ (Constant Acceleration)', 'সরলরৈখিক গতি (1D Motion)'],
    tags: ['motion', 'kinematics', 'hsc-physics', 'board-essential'],
    importance: f.importance || 5,
    usageCount: f.uses || 42,
    version: 1,
    knowledgeLinks: {
      relatedConcepts: ['গতিবিদ্যা (Kinematics)', "নিউটনের দ্বিতীয় সূত্র (Newton's 2nd Law)"],
      relatedFormulas: [
        { id: 'rel-1', title: 'গতির প্রথম সমীকরণ', latex: 'v = u + at' },
        { id: 'rel-2', title: 'গতির তৃতীয় সমীকরণ', latex: 'v^2 = u^2 + 2as' },
      ],
      bookReferences: [
        {
          bookId: 'phys-1st',
          bookTitle: 'পদার্থবিজ্ঞান প্রথম পত্র (NCTB)',
          pageNumber: 147,
          chapterTitle: 'নিউটনীয় বলবিদ্যা',
        },
      ],
      cqCount: 17,
      mcqCount: 34,
    },
  }));
}

export async function fetchFormulaById(formulaId: string): Promise<CanonicalFormula | null> {
  const all = await fetchFormulaCatalog();
  return all.find((f) => f.id === formulaId) || all[0] || null;
}
