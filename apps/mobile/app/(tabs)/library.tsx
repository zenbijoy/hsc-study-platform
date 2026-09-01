import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { LibraryScreen } from '@/src/features/library/screens/LibraryScreen';

export default function LibraryRoute() {
  const params = useLocalSearchParams<{
    subjectId?: string;
    paperNumber?: string;
    downloadedOnly?: string;
  }>();

  return (
    <LibraryScreen
      subjectId={typeof params.subjectId === 'string' ? params.subjectId : undefined}
      paperNumber={params.paperNumber ? parseInt(params.paperNumber, 10) : undefined}
      downloadedOnly={params.downloadedOnly === 'true'}
    />
  );
}
