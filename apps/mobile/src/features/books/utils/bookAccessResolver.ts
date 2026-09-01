import { AccessReasonCode, BookAccessStatus } from '../types/bookDetails.types';
import type { Book, BookVersion } from '@/src/types/book.types';

export function resolveBookAccess(
  book: Book | null,
  activeVersion: BookVersion | null,
  isAuthenticated: boolean,
  isOnline: boolean = true,
  isDownloaded: boolean = false
): {
  status: BookAccessStatus;
  canRead: boolean;
  canDownload: boolean;
  reasonCode: AccessReasonCode;
  reasonMessage: string;
} {
  if (!book) {
    return {
      status: 'unavailable',
      canRead: false,
      canDownload: false,
      reasonCode: 'BOOK_UNAVAILABLE',
      reasonMessage: 'This textbook is not currently available.',
    };
  }

  if (!activeVersion) {
    return {
      status: 'unavailable',
      canRead: false,
      canDownload: false,
      reasonCode: 'VERSION_UNAVAILABLE',
      reasonMessage: 'No published version available for this textbook.',
    };
  }

  // If offline and downloaded
  if (!isOnline) {
    if (isDownloaded) {
      return {
        status: 'available',
        canRead: true,
        canDownload: false,
        reasonCode: 'OFFLINE_LICENSE_VALID',
        reasonMessage: 'Offline reading available from downloaded package.',
      };
    } else {
      return {
        status: 'available',
        canRead: false,
        canDownload: false,
        reasonCode: 'NETWORK_REQUIRED',
        reasonMessage: 'Connect to the internet to read or download this book.',
      };
    }
  }

  // Free standard access
  return {
    status: 'available',
    canRead: true,
    canDownload: true,
    reasonCode: 'GRANTED',
    reasonMessage: 'Full reading access available.',
  };
}
