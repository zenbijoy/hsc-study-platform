export type ReaderDisplayMode = 'original' | 'sepia' | 'dark' | 'midnight';

export type ReaderPageDirection = 'vertical' | 'horizontal';

export interface ReaderSessionState {
  sessionId: string;
  bookId: string;
  versionId: string;
  mode: 'online' | 'offline' | 'demo';
  currentPage: number;
  totalPages: number;
  currentChapterTitle: string;
  isBookmarked: boolean;
  isLoading: boolean;
  message: string;
  error: string | null;
}

export interface ReaderSearchResult {
  id: string;
  pageNumber: number;
  chapterNumber?: number;
  chapterTitle?: string;
  snippet: string;
  matchTerm: string;
}

export interface ReaderSettings {
  displayMode: ReaderDisplayMode;
  pageDirection: ReaderPageDirection;
  brightness: number; // 0.0 to 1.0
  keepScreenAwake: boolean;
}
