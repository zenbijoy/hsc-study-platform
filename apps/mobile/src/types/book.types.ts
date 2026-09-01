export interface Chapter {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  banglaTitle: string;
  startPage: number;
  endPage: number;
  formulaCount: number;
  cqCount: number;
  mcqCount: number;
}

export interface BookVersion {
  id: string;
  bookId: string;
  version: number;
  pageCount: number;
  packageSha256?: string;
  deliveryUrl?: string;
  storageProvider: string;
  isActive: boolean;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  subjectId: string;
  publisher: string;
  pages: number;
  chapters: number;
  formulas: number;
  progress: number;
  lastPage: number;
  protected: boolean;
  publishedVersionId?: string;
  chapterList?: Chapter[];
}
