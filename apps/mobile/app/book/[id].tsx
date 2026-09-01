import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { BookDetailsScreen } from '@/src/features/books/screens/BookDetailsScreen';

export default function BookDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const validBookId = typeof id === 'string' ? id.trim() : '';

  return <BookDetailsScreen bookId={validBookId} />;
}
