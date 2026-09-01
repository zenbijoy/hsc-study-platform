import type { Book, Chapter } from '@/src/types/book.types';
import type { Formula } from '@/src/types/formula.types';
import type { CQQuestion, MCQQuestion } from '@/src/types/question.types';

export const bengaliBooksFixture: Book[] = [
  {
    id: 'phys-1',
    title: 'পদার্থবিজ্ঞান প্রথম পত্র (একাদশ-দ্বাদশ শ্রেণি)',
    subtitle: 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড অনুমোদিত সম্পূর্ণ পাঠ্যবই',
    subjectId: 'physics',
    publisher: 'হাসান বুক হাউস',
    pages: 480,
    chapters: 10,
    formulas: 142,
    progress: 45,
    lastPage: 128,
    protected: true,
  },
  {
    id: 'chem-1',
    title: 'উচ্চমাধ্যমিক রসায়ন প্রথম পত্র',
    subtitle: 'সৃজনশীল ও বহুনির্বাচনী প্রশ্ন সংবলিত প্রমিত সংস্করণ',
    subjectId: 'chemistry',
    publisher: 'অক্ষরপত্র প্রকাশনী',
    pages: 512,
    chapters: 5,
    formulas: 88,
    progress: 20,
    lastPage: 64,
    protected: true,
  },
];

export const bengaliChaptersFixture: Chapter[] = [
  {
    id: 'ch-vector',
    bookId: 'phys-1',
    chapterNumber: 2,
    title: 'ভেক্টর ও ভেক্টর বিশ্লেষণ',
    banglaTitle: 'দ্বিতীয় অধ্যায়: ভেক্টর',
    startPage: 46,
    endPage: 118,
    formulaCount: 24,
    cqCount: 42,
    mcqCount: 160,
  },
  {
    id: 'ch-mechanics',
    bookId: 'phys-1',
    chapterNumber: 4,
    title: 'নিউটনীয় বলবিদ্যা ও গতিসূত্র',
    banglaTitle: 'চতুর্থ অধ্যায়: নিউটনীয় বলবিদ্যা',
    startPage: 162,
    endPage: 238,
    formulaCount: 31,
    cqCount: 54,
    mcqCount: 195,
  },
];

export const bengaliFormulasFixture: Formula[] = [
  {
    id: 'form-motion-2',
    subjectId: 'physics',
    chapter: 'গতিবিদ্যা',
    title: 'গতির দ্বিতীয় সমীকরণ',
    latex: 's = ut + \\frac{1}{2}at^2',
    plain: 's = ut + ½at²',
    importance: 5,
    uses: 24,
    explanation: 'সুষম ত্বরণে চলমান বস্তুর সরণ, আদিবেগ, সময় এবং ত্বরণের মধ্যকার মৌলিক সম্পর্ক।',
    variables: [
      { symbol: 's', name: 'সরণ (Displacement)', unit: 'm' },
      { symbol: 'u', name: 'আদিবেগ (Initial Velocity)', unit: 'm/s' },
      { symbol: 'a', name: 'ত্বরণ (Acceleration)', unit: 'm/s²' },
      { symbol: 't', name: 'সময় (Time)', unit: 's' },
    ],
  },
];

export const bengaliCQsFixture: CQQuestion[] = [
  {
    id: 'cq-dhaka-2025',
    subjectId: 'physics',
    chapter: 'ভেক্টর',
    title: 'নৌকা ও নদীর স্রোতের আপেক্ষিক বেগ বিশ্লেষণ',
    board: 'ঢাকা বোর্ড',
    year: 2025,
    difficulty: 'medium',
    stimulus:
      'একটি নদীর প্রস্থ 1.5 km এবং স্রোতের বেগ 4 km/h। একজন মাঝি 6 km/h বেগে নৌকা চালিয়ে ঠিক অপর পাড়ে পৌঁছাতে চায়। অন্য একজন মাঝি সর্বনিম্ন সময়ে নদী পার হতে চায়।',
    subQuestions: [
      { letter: 'a', banglaLetter: 'ক', question: 'একক ভেক্টর কাকে বলে?', marks: 1, solution: 'যে ভেক্টরের মান এক একক তাকে একক ভেক্টর বলে।' },
      { letter: 'b', banglaLetter: 'খ', question: 'দুটি ভেক্টরের স্কেলার গুণন কখন শূন্য হয়? ব্যাখ্যা কর।', marks: 2, solution: 'যখন দুটি অশূন্য ভেক্টর পরস্পরের সাথে ৯০° কোণে লম্বভাবে অবস্থান করে।' },
      { letter: 'c', banglaLetter: 'গ', question: 'প্রথম মাঝির নদীর ঠিক বিপরীত বিন্দুতে পৌঁছানোর জন্য প্রয়োজনীয় কোণ নির্ণয় কর।', marks: 3, solution: 'cos α = -v/u = -4/6 => α = 131.81°' },
      { letter: 'd', banglaLetter: 'ঘ', question: 'উভয় মাঝির পারাপারের সময় গাণিতিকভাবে তুলনা কর।', marks: 4, solution: 't1 = d / (u sin α) = 0.335 h; t2 = d / u = 0.25 h। সুতরাং দ্বিতীয় মাঝির সময় কম লাগবে।' },
    ],
  },
];
