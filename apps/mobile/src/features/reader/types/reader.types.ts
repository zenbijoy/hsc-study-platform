import type { Chapter } from '@/src/types/book.types';

export type ReaderDisplayMode = 'original' | 'sepia' | 'dark' | 'midnight';
export type ReaderPageDirection = 'vertical' | 'horizontal';
export type ReaderFitMode = 'fit-width' | 'fit-page' | 'auto';

export interface ReaderLaunchRequest {
  bookId: string;
  versionId?: string;
  requestedPage?: number;
  chapterId?: string;
}

export type ReaderLaunchResolution =
  | {
      mode: 'offline-hscp';
      bookId: string;
      versionId: string;
      packageUri: string;
      contentKey: Uint8Array;
      initialPage: number;
    }
  | {
      mode: 'online-protected';
      bookId: string;
      versionId: string;
      deliveryUrl: string;
      initialPage: number;
    }
  | {
      mode: 'demo';
      bookId: string;
      versionId?: string;
      initialPage: number;
      demoReason: string;
    }
  | {
      mode: 'blocked';
      bookId: string;
      reason: 'UNVERIFIED_RIGHTS' | 'LICENSE_EXPIRED' | 'PACKAGE_MISSING' | 'PACKAGE_CORRUPT' | 'AUTH_REQUIRED' | 'BOOK_NOT_FOUND';
      message: string;
    };

export interface ReaderSessionState {
  sessionId: string;
  bookId: string;
  versionId: string;
  mode: 'online-protected' | 'offline-hscp' | 'demo' | 'blocked';
  currentPage: number;
  totalPages: number;
  currentChapterTitle: string;
  currentChapterId?: string;
  isBookmarked: boolean;
  hasNoteOnCurrentPage: boolean;
  isLoading: boolean;
  controlsVisible: boolean;
  fullscreen: boolean;
  message: string;
  error: string | null;
}

export interface ReaderSettings {
  displayMode: ReaderDisplayMode;
  pageDirection: ReaderPageDirection;
  fitMode: ReaderFitMode;
  brightness: number; // 0.1 to 1.0 (1.0 = normal, 0.3 = dimmed)
  keepScreenAwake: boolean;
  autoHideControls: boolean;
}

export interface ReaderSearchResult {
  id: string;
  pageNumber: number;
  chapterNumber?: number;
  chapterTitle?: string;
  snippet: string;
  matchTerm: string;
}

export interface ReaderBookmark {
  id: string;
  bookId: string;
  versionId?: string;
  pageNumber: number;
  chapterId?: string;
  chapterTitle?: string;
  title?: string;
  note?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface ReaderNote {
  id: string;
  bookId: string;
  versionId?: string;
  pageNumber: number;
  chapterId?: string;
  chapterTitle?: string;
  text: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReaderLocationHistoryItem {
  pageNumber: number;
  chapterTitle?: string;
  timestamp: number;
  trigger: 'search' | 'formula' | 'cq' | 'toc' | 'jump' | 'bookmark';
}

export interface ReaderChapterItem extends Chapter {
  sectionType?: 'preface' | 'toc' | 'chapter' | 'appendix' | 'index';
  readingProgress?: number; // 0 to 100
}

export interface ReaderContextToolData {
  chapter?: ReaderChapterItem;
  relatedFormulas: { id: string; title: string; latex: string; pageNumber?: number }[];
  relatedCQs: { id: string; title: string; board: string; year: number; pageNumber?: number }[];
  pageNotes: ReaderNote[];
}

export interface PdfReaderController {
  goToPage: (page: number, recordHistory?: boolean, trigger?: ReaderLocationHistoryItem['trigger']) => void;
  nextPage: () => void;
  previousPage: () => void;
  jumpToChapter: (chapter: Chapter) => void;
  canGoBackLocation: boolean;
  goBackLocation: () => void;
  toggleControls: () => void;
  setControlsVisible: (visible: boolean) => void;
  toggleFullscreen: () => void;
  setDisplayMode: (mode: ReaderDisplayMode) => void;
  setPageDirection: (direction: ReaderPageDirection) => void;
  setBrightness: (brightness: number) => void;
  setKeepScreenAwake: (keepAwake: boolean) => void;
  close: () => Promise<void>;
}
