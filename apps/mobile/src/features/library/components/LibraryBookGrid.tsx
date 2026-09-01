import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { BookCardGrid } from '@/src/components/domain/BookCardSystem';
import { LibraryBookViewModel } from '../types/library.types';

export function LibraryBookGrid({
  books,
}: {
  books: LibraryBookViewModel[];
}) {
  const router = useRouter();

  return (
    <View className="gap-1">
      {books.map((book) => (
        <BookCardGrid
          key={book.id}
          book={{
            id: book.id,
            title: book.title,
            subtitle: book.subtitle || '',
            subjectId: book.subjectId,
            publisher: book.publisher || 'NCTB Approved',
            pages: book.totalPages,
            chapters: book.chapters,
            formulas: book.formulas,
            progress: book.progress,
            lastPage: book.lastPage,
            protected: true,
          }}
          onPress={() => router.push(`/book/${book.id}` as any)}
        />
      ))}
    </View>
  );
}
