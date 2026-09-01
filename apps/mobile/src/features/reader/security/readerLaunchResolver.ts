import { getDownloadedPackage } from '@/lib/download';
import { getCachedContentKey, requestBookLicense } from '@/lib/license';
import { ensureRegisteredDevice } from '@/lib/devices';
import type { ReaderLaunchRequest, ReaderLaunchResolution } from '../types/reader.types';

/**
 * Resolves a ReaderLaunchRequest into a concrete offline-hscp, online-protected, demo, or blocked session.
 * Guarantees zero sensitive tokens, Drive URLs, or encryption keys in route params.
 */
export async function resolveReaderLaunch(
  request: ReaderLaunchRequest
): Promise<ReaderLaunchResolution> {
  const { bookId, versionId, requestedPage = 1 } = request;

  if (!bookId) {
    return {
      mode: 'blocked',
      bookId: '',
      reason: 'BOOK_NOT_FOUND',
      message: 'Invalid book identifier.',
    };
  }

  // 1. If versionId is present, check offline downloaded package first
  if (versionId) {
    const downloadedPkg = getDownloadedPackage(versionId);
    const cachedKey = await getCachedContentKey(versionId);

    if (downloadedPkg && cachedKey) {
      return {
        mode: 'offline-hscp',
        bookId,
        versionId,
        packageUri: downloadedPkg.uri,
        contentKey: cachedKey,
        initialPage: requestedPage,
      };
    }

    // Attempt online license verification & download key retrieval if online
    try {
      const deviceId = await ensureRegisteredDevice();
      if (deviceId) {
        const license = await requestBookLicense(versionId, deviceId);
        if (license?.deliveryUrl) {
          return {
            mode: 'online-protected',
            bookId,
            versionId,
            deliveryUrl: license.deliveryUrl,
            initialPage: requestedPage,
          };
        }
      }
    } catch {
      // Offline fallback without active license
      if (downloadedPkg && !cachedKey) {
        return {
          mode: 'blocked',
          bookId,
          reason: 'LICENSE_EXPIRED',
          message: 'Connect to the internet to refresh offline access.',
        };
      }
    }
  }

  // Fallback to Demo / Preview Mode for instant study evaluation
  return {
    mode: 'demo',
    bookId,
    versionId,
    initialPage: requestedPage,
    demoReason: 'Using secure study preview mode.',
  };
}
