import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Book } from '@/src/types/book.types';
import { ContinueReadingCard } from '@/src/components/domain/BookCardSystem';
import { Section, SectionHeader } from '@/src/components/ui/Layout';
import { EmptyState } from '@/src/components/ui/FeedbackStates';

export function ContinueReadingSection({
  books,
  title = 'Continue Reading',
  subtitle = 'Pick up right where you left off',
}: {
  books: Book[];
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const primaryBook = books[0];

  if (!primaryBook) {
    return (
      <Section className="mb-4">
        <SectionHeader title={title} subtitle={subtitle} />
        <EmptyState
          icon="book-outline"
          title="Start Your First Book"
          description="Open any HSC textbook to begin tracking your reading progress and bookmarks."
          actionLabel="Explore Library"
          onAction={() => router.push('/(tabs)/library' as any)}
        />
      </Section>
    );
  }

  return (
    <Section className="mb-4">
      <SectionHeader title={title} subtitle={subtitle} />
      <ContinueReadingCard
        book={primaryBook}
        onPress={() => router.push(`/reader/${primaryBook.id}` as any)}
      />
    </Section>
  );
}
