import { File } from 'expo-file-system';
import { materializePdfToCache, secureDeleteCacheFile } from '@/lib/hscp';

export async function createProtectedReaderFile(
  encryptedPackageUri: string,
  contentKey: Uint8Array
): Promise<File | null> {
  try {
    return await materializePdfToCache(encryptedPackageUri, contentKey);
  } catch (err) {
    return null;
  }
}

export function cleanupProtectedReaderFile(file: File | null): void {
  if (file) {
    secureDeleteCacheFile(file);
  }
}
