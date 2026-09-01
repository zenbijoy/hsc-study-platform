import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SecureReaderScreen } from '@/src/features/reader/screens/SecureReaderScreen';

export default function ReaderRoute() {
  const { id, version, initialPage, page } = useLocalSearchParams<{
    id: string;
    version?: string;
    initialPage?: string;
    page?: string;
  }>();

  const validBookId = typeof id === 'string' ? id.trim() : 'phys-1st';
  const validVersion = typeof version === 'string' ? version.trim() : undefined;
  const startPageStr = page || initialPage;
  const startPage = startPageStr ? parseInt(startPageStr, 10) : 1;

  return (
    <SecureReaderScreen
      bookId={validBookId}
      versionId={validVersion}
      initialPage={Number.isNaN(startPage) ? 1 : startPage}
    />
  );
}
