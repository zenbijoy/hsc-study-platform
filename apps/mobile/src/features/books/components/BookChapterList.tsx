import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import { Section, SectionHeader } from '@/src/components/ui/Layout';
import { BookDetailsChapter } from '../types/bookDetails.types';

export function BookChapterList({
  bookId,
  subjectId,
  chapters,
}: {
  bookId: string;
  subjectId: string;
  chapters: BookDetailsChapter[];
}) {
  const theme = useTheme();
  const router = useRouter();
  const subTheme = resolveSubjectTheme(subjectId);

  return (
    <Section className="mb-4">
      <SectionHeader
        title="Chapter Index & Page Map"
        subtitle="Direct page bounds for NCTB textbook edition"
      />

      <View className="gap-2">
        {chapters.map((ch) => (
          <Card
            key={ch.id}
            variant="interactive"
            onPress={() => router.push(`/reader/${bookId}?page=${ch.startPage}` as any)}
            accessibilityLabel={`Open Chapter ${ch.chapterNumber}: ${ch.title}`}
            className="p-3.5"
            style={{
              backgroundColor: theme.colors.surface,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 gap-3">
                {/* Chapter Number Badge */}
                <View
                  style={{
                    backgroundColor: subTheme.tintBg,
                    borderRadius: theme.radius.md,
                    width: 36,
                    height: 36,
                  }}
                  className="items-center justify-center"
                >
                  <AppText variant="labelMedium" style={{ color: subTheme.primary, fontWeight: '700' }}>
                    {String(ch.chapterNumber).padStart(2, '0')}
                  </AppText>
                </View>

                {/* Chapter Info */}
                <View className="flex-1">
                  <AppText variant="titleMedium" color="primary" numberOfLines={1}>
                    {ch.title}
                  </AppText>

                  <View className="flex-row items-center gap-2 mt-1">
                    <AppText variant="caption" color="muted">
                      pp. {ch.startPage}–{ch.endPage}
                    </AppText>
                    <AppText variant="caption" color="muted">•</AppText>
                    <AppText variant="caption" color="mint">
                      {ch.formulaCount} Formulas
                    </AppText>
                    <AppText variant="caption" color="muted">•</AppText>
                    <AppText variant="caption" color="sky">
                      {ch.cqCount} CQs
                    </AppText>
                  </View>
                </View>
              </View>

              {/* Read Action Pill */}
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: theme.radius.sm,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
                className="flex-row items-center gap-1"
              >
                <AppText variant="caption" color="muted">
                  Read
                </AppText>
                <Ionicons name="chevron-forward" size={12} color={theme.colors.textMuted} />
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Section>
  );
}
