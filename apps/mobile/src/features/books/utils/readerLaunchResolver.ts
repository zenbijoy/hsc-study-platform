import { ReaderLaunchContext } from '../types/bookDetails.types';

export function resolveReaderLaunch({
  bookId,
  versionId,
  requestedPage = 1,
  chapterId,
  isDownloaded = false,
  isOnline = true,
}: {
  bookId: string;
  versionId?: string;
  requestedPage?: number;
  chapterId?: string;
  isDownloaded?: boolean;
  isOnline?: boolean;
}): ReaderLaunchContext {
  if (!versionId) {
    return {
      bookId,
      versionId: '',
      requestedPage,
      chapterId,
      mode: 'blocked',
      reason: 'Version unavailable',
    };
  }

  if (isDownloaded) {
    return {
      bookId,
      versionId,
      requestedPage,
      chapterId,
      mode: 'offline',
    };
  }

  if (isOnline) {
    return {
      bookId,
      versionId,
      requestedPage,
      chapterId,
      mode: 'online',
    };
  }

  return {
    bookId,
    versionId,
    requestedPage,
    chapterId,
    mode: 'blocked',
    reason: 'Connect to internet or download book first',
  };
}
