import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Book } from '@/src/types/book.types';
import { BookCardGrid } from '@/src/components/domain/BookCardSystem';
import { Section, SectionHeader } from '@/src/components/ui/Layout';
import { AnnouncementItem } from '../types/home.types';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';

export function RecentlyAddedSection({
  books,
  title = 'Recently Added to Library',
}: {
  books: Book[];
  title?: string;
}) {
  const router = useRouter();

  if (!books || books.length === 0) return null;

  return (
    <Section className="mb-4">
      <SectionHeader title={title} subtitle="New syllabus textbooks and updated editions" />
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

export function AnnouncementBanner({
  announcement,
  onDismiss,
}: {
  announcement: AnnouncementItem;
  onDismiss?: () => void;
}) {
  const theme = useTheme();

  return (
    <Card
      variant="elevated"
      className="p-3.5 mb-4 flex-row items-center justify-between"
      style={{
        backgroundColor: 'rgba(108, 183, 255, 0.12)',
        borderColor: 'rgba(108, 183, 255, 0.30)',
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-center gap-3 flex-1 pr-2">
        <Ionicons name="megaphone-outline" size={20} color="#6CB7FF" />
        <View className="flex-1">
          <AppText variant="labelMedium" color="sky">
            {announcement.title}
          </AppText>
          <AppText variant="caption" color="secondary" numberOfLines={2}>
            {announcement.message}
          </AppText>
        </View>
      </View>

      {onDismiss && (
        <Ionicons
          name="close"
          size={18}
          color={theme.colors.textMuted}
          onPress={onDismiss}
        />
      )}
    </Card>
  );
}
