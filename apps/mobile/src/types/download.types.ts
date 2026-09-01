export type DownloadStatus =
  | 'queued'
  | 'authorizing'
  | 'downloading'
  | 'paused'
  | 'verifying'
  | 'ready'
  | 'failed'
  | 'expired';

export interface PackageDownloadState {
  bookVersionId: string;
  bookId: string;
  status: DownloadStatus;
  progress: number;
  bytesDownloaded: number;
  totalBytes: number;
  localUri?: string;
  error?: string;
}
