export const queryKeys = {
  subjects: {
    all: ['subjects'] as const,
    detail: (id: string) => ['subjects', id] as const,
  },
  books: {
    all: ['books'] as const,
    detail: (id: string) => ['books', id] as const,
    bySubject: (subjectId: string) => ['books', 'subject', subjectId] as const,
  },
  formulas: {
    all: ['formulas'] as const,
    detail: (id: string) => ['formulas', id] as const,
    bySubject: (subjectId: string) => ['formulas', 'subject', subjectId] as const,
    byChapter: (chapter: string) => ['formulas', 'chapter', chapter] as const,
  },
  progress: {
    all: ['progress'] as const,
    book: (bookId: string) => ['progress', bookId] as const,
  },
  profile: {
    current: ['profile', 'current'] as const,
  },
} as const;
