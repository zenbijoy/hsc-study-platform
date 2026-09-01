import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import { Section, SectionHeader } from '@/src/components/ui/Layout';
import { CQBookReference } from '../types/cq.types';

export function CQBookReferences({
  bookReferences,
}: {
  bookReferences?: CQBookReference[];
}) {
  const theme = useTheme();
  const router = useRouter();

  if (!bookReferences || bookReferences.length === 0) return null;

  return (
    <Section className="mb-4">
      <SectionHeader
        title="Textbook References"
        subtitle="Read the core concept in approved NCTB textbooks"
      />

      <View className="gap-2">
        {bookReferences.map((ref) => (
          <Card
            key={`${ref.bookId}-${ref.pageNumber}`}
            variant="interactive"
            onPress={() =>
              router.push(`/reader/${ref.bookId}?page=${ref.pageNumber}` as any)
            }
            accessibilityLabel={`Open ${ref.bookTitle} at page ${ref.pageNumber}`}
            className="p-3.5"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <View
                  style={{
                    backgroundColor: 'rgba(87, 224, 183, 0.15)',
                    borderRadius: theme.radius.md,
                    width: 40,
                    height: 40,
                  }}
                  className="items-center justify-center"
                >
                  <Ionicons name="book" size={20} color={theme.colors.primary} />
                </View>

                <View className="flex-1">
                  <AppText variant="titleMedium" color="primary" numberOfLines={1}>
                    {ref.bookTitle}
                  </AppText>
                  <AppText variant="caption" color="muted">
                    Page {ref.pageNumber} • {ref.chapterTitle || 'Textbook Reference'}
                  </AppText>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radius.sm,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
                className="flex-row items-center gap-1 active:opacity-85"
              >
                <AppText variant="caption" style={{ color: '#071018', fontWeight: '800' }}>
                  Read Page
                </AppText>
                <Ionicons name="arrow-forward" size={12} color="#071018" />
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Section>
  );
}
