import { File } from 'expo-file-system';
import { createProtectedReaderFile, cleanupProtectedReaderFile } from './plaintextLifecycle';
import { enableScreenCaptureProtection, disableScreenCaptureProtection } from './screenCapture';
import { verifyPackageContainer } from './packageIntegrity';
import type { ReaderLaunchResolution } from '../types/reader.types';

export class ProtectedReaderSession {
  private tag: string;
  private tempPdfFile: File | null = null;
  private isDestroyed: boolean = false;

  constructor(tag: string = 'hsc-reader') {
    this.tag = tag;
  }

  async initialize(resolution: ReaderLaunchResolution): Promise<{
    file: File | null;
    error: string | null;
  }> {
    await enableScreenCaptureProtection(this.tag);

    if (resolution.mode === 'offline-hscp') {
      const packageFile = new File(resolution.packageUri);
      const integrity = verifyPackageContainer(packageFile);
      if (!integrity.isValid) {
        return { file: null, error: integrity.error || 'Corrupted offline package.' };
      }

      try {
        const file = await createProtectedReaderFile(resolution.packageUri, resolution.contentKey);
        if (this.isDestroyed) {
          cleanupProtectedReaderFile(file);
          return { file: null, error: 'Session was closed during initialization.' };
        }
        this.tempPdfFile = file;
        return { file, error: null };
      } catch (err: any) {
        return { file: null, error: err?.message || 'Failed to decrypt package.' };
      }
    }

    // Demo or online mode (virtualized placeholder or stream)
    return { file: null, error: null };
  }

  async destroy(): Promise<void> {
    this.isDestroyed = true;
    if (this.tempPdfFile) {
      cleanupProtectedReaderFile(this.tempPdfFile);
      this.tempPdfFile = null;
    }
    await disableScreenCaptureProtection(this.tag);
  }

  getTempFile(): File | null {
    return this.tempPdfFile;
  }
}
