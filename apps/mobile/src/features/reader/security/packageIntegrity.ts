import { File } from 'expo-file-system';
import { readHscpHeader } from '@/lib/hscp';

/**
 * Validates the cryptographic container structure of an HSCP package before decryption.
 */
export function verifyPackageContainer(file: File): {
  isValid: boolean;
  bookId?: string;
  version?: number;
  totalChunks?: number;
  error?: string;
} {
  try {
    if (!file.exists || (file.size ?? 0) <= 0) {
      return { isValid: false, error: 'Package file does not exist or is empty.' };
    }

    const { header } = readHscpHeader(file);
    if (!header.bookId || !header.chunks || header.chunks.length === 0) {
      return { isValid: false, error: 'Malformed package header manifest.' };
    }

    return {
      isValid: true,
      bookId: header.bookId,
      version: header.version,
      totalChunks: header.chunks.length,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err?.message || 'Invalid or corrupt package structure.',
    };
  }
}
