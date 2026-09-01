import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Section, SectionHeader } from '@/src/components/ui/Layout';
import { EmptyState } from '@/src/components/ui/FeedbackStates';
import { ChapterCard } from '@/src/components/domain/ChapterCard';
import { SyllabusChapter } from '../types/subject.types';

export function ChapterSection({
  chapters,
  paperTitle,
}: {
  chapters: SyllabusChapter[];
  paperTitle?: string;
}) {
  const router = useRouter();

  if (!chapters || chapters.length === 0) {
    return (
      <Section className="mb-4">
        <SectionHeader
          title="Syllabus Chapters"
          subtitle={paperTitle ? `Chapters for ${paperTitle}` : undefined}
        />
        <EmptyState
          icon="document-text-outline"
          title="Content Being Prepared"
          description="Syllabus chapters and question banks for this paper will be published soon."
        />
      </Section>
    );
  }

  return (
    <Section className="mb-4">
      <SectionHeader
        title="Syllabus Chapters"
        subtitle={paperTitle ? `Complete chapter breakdown for ${paperTitle}` : undefined}
      />
      <View className="gap-1">
        {chapters.map((ch) => (
          <ChapterCard
            key={ch.id}
            chapter={{
              id: ch.id,
              bookId: ch.subjectId,
              chapterNumber: ch.chapterNumber,
              title: ch.titleEn,
              banglaTitle: ch.titleBn,
              startPage: ch.startPage || 1,
              endPage: ch.endPage || 50,
              formulaCount: ch.formulaCount,
              cqCount: ch.cqCount,
              mcqCount: ch.mcqCount,
            }}
            onPress={() => router.push(`/chapter/${ch.id}` as any)}
          />
        ))}
      </View>
    </Section>
  );
}
