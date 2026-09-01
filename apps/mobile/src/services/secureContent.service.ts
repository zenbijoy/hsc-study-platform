import { File } from 'expo-file-system';
import { getCachedContentKey, requestBookLicense, unwrapLicense } from '@/lib/license';
import { materializePdfToCache, secureDeleteCacheFile } from '@/lib/hscp';
import { getDevicePublicKeyB64 } from '@/lib/deviceKeys';
import { createAppError } from '@/src/types/error.types';

export interface SecureContentSession {
  cachePdfFile: File;
  cachePdfUri: string;
  bookVersionId: string;
}

export class SecureContentService {
  /**
   * Unwraps or requests a device license, then decrypts an offline HSCP package
   * into the secure app sandbox cache for rendering.
   */
  public static async openLicensedPackage(
    hscpUri: string,
    bookVersionId: string,
    deviceId?: string
  ): Promise<SecureContentSession> {
    try {
      // 1. Check cached content key or request new license
      let contentKey = await getCachedContentKey(bookVersionId);

      if (!contentKey) {
        const targetDeviceId = deviceId || (await getDevicePublicKeyB64());
        const envelope = await requestBookLicense(bookVersionId, targetDeviceId);
        contentKey = await unwrapLicense(envelope);
      }

      // 2. Decrypt HSCP package to temp sandbox cache
      const cachedFile = await materializePdfToCache(hscpUri, contentKey);

      return {
        cachePdfFile: cachedFile,
        cachePdfUri: cachedFile.uri,
        bookVersionId,
      };
    } catch (error: any) {
      console.error('[SecureContentService] Decryption failed:', error);
      throw createAppError(
        'CRYPTO_ERROR',
        error?.message || 'Failed to decrypt secure book package',
        'Could not unlock this book. Please verify your license.',
        error
      );
    }
  }

  /**
   * Securely purges the temporary plaintext PDF from cache immediately upon reader close.
   */
  public static async closeLicensedPackage(cachePdfFile: File | null): Promise<void> {
    if (!cachePdfFile) return;
    try {
      secureDeleteCacheFile(cachePdfFile);
    } catch (error) {
      console.warn('[SecureContentService] Cache cleanup error:', error);
    }
  }
}
