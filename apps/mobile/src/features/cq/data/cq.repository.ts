import { bengaliCQsFixture } from '@/src/fixtures/bengaliFixtures';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase/client';
import { CanonicalCQ } from '../types/cq.types';

export async function fetchCQCatalog(): Promise<CanonicalCQ[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('type', 'cq')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          subjectId: item.subject_id,
          subjectName: item.subject_id === 'physics' ? 'Physics' : item.subject_id === 'chemistry' ? 'Chemistry' : 'Higher Math',
          chapterTitle: item.chapter_label || 'ভেক্টর',
          title: item.title || 'নৌকা ও নদীর স্রোতের আপেক্ষিক বেগ বিশ্লেষণ',
          board: item.board || 'ঢাকা বোর্ড',
          year: item.year || 2025,
          isOfficialBoard: true,
          difficulty: 'medium',
          importance: 5,
          stimulus: item.stimulus || 'একটি নদীর প্রস্থ 1.5 km এবং স্রোতের বেগ 4 km/h...',
          subQuestions: (item.sub_questions || []).map((sq: any) => ({
            id: sq.id || sq.letter,
            letter: sq.letter,
            banglaLetter: sq.banglaLetter || 'ক',
            question: sq.question,
            marks: sq.marks || 1,
            solution: sq.solution,
          })),
          totalMarks: 10,
          formulaReferences: [
            { id: 'rel-1', title: 'গতির প্রথম সমীকরণ', latex: 'v = u + at' },
          ],
          bookReferences: [
            {
              bookId: 'phys-1st',
              bookTitle: 'পদার্থবিজ্ঞান প্রথম পত্র (NCTB)',
              pageNumber: 147,
              chapterTitle: 'নিউটনীয় বলবিদ্যা',
            },
          ],
          tags: ['vector', 'relative-velocity', 'board-2025'],
          version: 1,
        }));
      }
    } catch {
      // Fallback to local fixtures
    }
  }

  // Map local fixture to CanonicalCQ
  return bengaliCQsFixture.map((cq, idx) => ({
    id: cq.id || `cq-${idx}`,
    subjectId: cq.subjectId,
    subjectName: cq.subjectId === 'physics' ? 'Physics' : cq.subjectId === 'chemistry' ? 'Chemistry' : 'Higher Math',
    chapterNumber: 2,
    chapterTitle: cq.chapter || 'ভেক্টর (Vectors)',
    title: cq.title,
    board: cq.board || 'ঢাকা বোর্ড',
    year: cq.year || 2025,
    isOfficialBoard: true,
    difficulty: (cq.difficulty as any) || 'medium',
    importance: 5,
    stimulus: cq.stimulus,
    subQuestions: cq.subQuestions.map((sq, sIdx) => ({
      id: `part-${sIdx}`,
      letter: sq.letter,
      banglaLetter: sq.banglaLetter,
      question: sq.question,
      marks: sq.marks,
      solution: sq.solution,
    })),
    totalMarks: cq.subQuestions.reduce((sum, q) => sum + q.marks, 0) || 10,
    formulaReferences: [
      { id: 'rel-1', title: 'ভেক্টর স্কেলার গুণন', latex: '\\vec{A} \\cdot \\vec{B} = AB \\cos \\theta' },
      { id: 'rel-2', title: 'আপেক্ষিক বেগ সমীকরণ', latex: 'v = \\frac{d}{t}' },
    ],
    bookReferences: [
      {
        bookId: 'phys-1st',
        bookTitle: 'পদার্থবিজ্ঞান প্রথম পত্র (NCTB)',
        pageNumber: 147,
        chapterTitle: 'নিউটনীয় বলবিদ্যা',
      },
    ],
    tags: ['vector', 'motion', 'dhaka-board', 'creative-question'],
    version: 1,
  }));
}

export async function fetchCQById(cqId: string): Promise<CanonicalCQ | null> {
  const all = await fetchCQCatalog();
  return all.find((cq) => cq.id === cqId) || all[0] || null;
}
