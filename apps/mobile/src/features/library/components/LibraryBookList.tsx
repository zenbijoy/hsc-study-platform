import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import { LinearProgress } from '@/src/components/ui/Progress';
import { LibraryBookViewModel } from '../types/library.types';

export function LibraryBookList({
  books,
}: {
  books: LibraryBookViewModel[];
}) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View className="gap-2.5">
      {books.map((book) => {
        const subTheme = resolveSubjectTheme(book.subjectId);

        return (
          <Card
            key={book.id}
            variant="interactive"
            onPress={() => router.push(`/book/${book.id}` as any)}
            accessibilityLabel={`Open book ${book.title}`}
            className="p-3.5"
            style={{
              backgroundColor: theme.colors.surface,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 gap-3">
                <View
                  style={{
                    backgroundColor: subTheme.tintBg,
                    borderRadius: theme.radius.md,
                    width: 44,
                    height: 44,
                  }}
                  className="items-center justify-center"
                >
                  <Ionicons name={subTheme.icon as any} size={22} color={subTheme.primary} />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <AppText variant="titleMedium" color="primary" numberOfLines={1}>
                      {book.title}
                    </AppText>
                    {book.isDownloaded && (
                      <Ionicons name="cloud-done" size={14} color="#57E0B7" />
                    )}
                  </View>

                  <View className="flex-row items-center gap-2 mt-1">
                    <AppText variant="caption" color="muted">
                      {book.subjectName}
                    </AppText>
                    <AppText variant="caption" color="muted">•</AppText>
                    <AppText variant="caption" color="muted">
                      {book.publisher}
                    </AppText>
                    <AppText variant="caption" color="muted">•</AppText>
                    <AppText variant="caption" color="muted">
                      {book.totalPages} pages
                    </AppText>
                  </View>

                  {book.progress > 0 && (
                    <View className="mt-2 w-3/4">
                      <LinearProgress percentage={book.progress} height={3} color={subTheme.primary} />
                    </View>
                  )}
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </View>
          </Card>
        );
      })}
    </View>
  );
}
