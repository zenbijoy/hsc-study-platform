import React from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Book } from '@/src/types/book.types';
import { BookCardGrid } from '@/src/components/domain/BookCardSystem';
import { Section, SectionHeader } from '@/src/components/ui/Layout';

export function RecommendedBooksSection({
  books,
  title = 'Recommended Textbooks',
  subtitle = 'Curated for your academic group',
}: {
  books: Book[];
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();

  if (!books || books.length === 0) return null;

  return (
    <Section className="mb-4">
      <SectionHeader title={title} subtitle={subtitle} />
      <View className="gap-1">
        {books.map((book) => (
          <BookCardGrid
            key={book.id}
            book={book}
            onPress={() => router.push(`/reader/${book.id}` as any)}
          />
        ))}
      </View>
    </Section>
  );
}
