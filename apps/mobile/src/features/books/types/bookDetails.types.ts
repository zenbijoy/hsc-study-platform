import type { Book, BookVersion } from '@/src/types/book.types';
import type { Formula } from '@/src/types/formula.types';

export type BookAccessStatus =
  | 'available'
  | 'requires_entitlement'
  | 'restricted'
  | 'unavailable'
  | 'coming_soon';

export type AccessReasonCode =
  | 'GRANTED'
  | 'AUTH_REQUIRED'
  | 'ENTITLEMENT_REQUIRED'
  | 'DEVICE_LIMIT'
  | 'LICENSE_EXPIRED'
  | 'BOOK_UNAVAILABLE'
  | 'VERSION_UNAVAILABLE'
  | 'NETWORK_REQUIRED'
  | 'OFFLINE_LICENSE_VALID'
  | 'OFFLINE_LICENSE_EXPIRED';

export type DownloadStatus =
  | 'idle'
  | 'queued'
  | 'authorizing'
  | 'downloading'
  | 'paused'
  | 'verifying'
  | 'ready'
  | 'failed'
  | 'expired';

export interface ReaderLaunchContext {
  bookId: string;
  versionId: string;
  requestedPage: number;
  chapterId?: string;
  mode: 'online' | 'offline' | 'blocked';
  reason?: string;
}

export interface BookDetailsChapter {
  id: string;
  syllabusChapterId?: string;
  chapterNumber: number;
  title: string;
  banglaTitle?: string;
  startPage: number;
  endPage: number;
  formulaCount: number;
  cqCount: number;
  mcqCount: number;
  progress: number;
  isDownloaded: boolean;
}

export interface BookDetailsViewModel {
  book: Book;
  activeVersion: BookVersion | null;
  access: {
    status: BookAccessStatus;
    canRead: boolean;
    canDownload: boolean;
    reasonCode: AccessReasonCode;
    reasonMessage: string;
  };
  progress: {
    progressPercentage: number;
    currentPage: number;
    totalPages: number;
    currentChapterTitle: string;
    lastReadAt?: string;
  };
  chapters: BookDetailsChapter[];
  stats: {
    chapterCount: number;
    totalPages: number;
    formulaCount: number;
    cqCount: number;
    mcqCount: number;
    bookmarkCount: number;
  };
  download: {
    status: DownloadStatus;
    downloadedBytes: number;
    totalBytes: number;
    progressPercent: number;
    isReady: boolean;
  };
  formulasPreview: Formula[];
  hasUpdate: boolean;
}
