import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { AppText } from '@/src/components/ui/Typography';
import { Badge } from '@/src/components/ui/Chip';
import type { Book } from '@/src/types/book.types';

export function BookDetailsHero({
  book,
  isDownloaded,
}: {
  book: Book;
  isDownloaded: boolean;
}) {
  const theme = useTheme();
  const subTheme = resolveSubjectTheme(book.subjectId);

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.xxl,
        padding: 18,
      }}
      className="mb-4"
    >
      <View className="flex-row gap-4 items-start">
        {/* Book Icon / Cover placeholder */}
        <View
          style={{
            backgroundColor: subTheme.tintBg,
            borderColor: subTheme.primary,
            borderWidth: 1.5,
            borderRadius: theme.radius.xl,
            width: 72,
            height: 96,
          }}
          className="items-center justify-center shadow-lg"
        >
          <Ionicons name={subTheme.icon as any} size={36} color={subTheme.primary} />
        </View>

        {/* Metadata Details */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1.5 flex-wrap">
            <Badge label={book.subjectId.toUpperCase()} variant="primary" />
            {isDownloaded && <Badge label="OFFLINE READY 💾" variant="primary" />}
          </View>

          <AppText variant="titleLarge" color="primary" style={{ fontWeight: '800' }}>
            {book.title}
          </AppText>

          {book.subtitle ? (
            <AppText variant="caption" color="secondary" className="mt-0.5">
              {book.subtitle}
            </AppText>
          ) : null}

          <View className="flex-row items-center gap-2 mt-2">
            <AppText variant="caption" color="muted">
              {book.publisher || 'NCTB Approved'}
            </AppText>
            <AppText variant="caption" color="muted">•</AppText>
            <AppText variant="caption" color="muted">
              {book.pages} Pages
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}
