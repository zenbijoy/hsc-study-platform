import React from 'react';
import { SecurePdfViewerScreen } from './SecurePdfViewerScreen';

export { SecurePdfViewerScreen };

export function SecureReaderScreen({
  bookId,
  versionId,
  initialPage = 1,
}: {
  bookId: string;
  versionId?: string;
  initialPage?: number;
}) {
  return (
    <SecurePdfViewerScreen
      bookId={bookId}
      versionId={versionId}
      initialPage={initialPage}
    />
  );
}
