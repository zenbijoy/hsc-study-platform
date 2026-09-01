export type SyncStatus = 'idle' | 'syncing' | 'error';

export interface ReadingProgressItem {
  userId: string;
  bookId: string;
  pageNumber: number;
  percentage: number;
  lastReadAt: string;
  isSynced: boolean;
}

export interface BookmarkRecord {
  id: string;
  userId: string;
  bookId: string;
  pageNumber: number;
  title?: string;
  note?: string;
  createdAt: string;
  isSynced: boolean;
}
