import React from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Subject } from '@/src/types/subject.types';
import { SubjectCard } from '@/src/components/domain/SubjectCard';
import { Section, SectionHeader } from '@/src/components/ui/Layout';

export function SubjectsSection({
  subjects,
  title = 'Your Subjects',
  subtitle = 'Prioritized for your HSC syllabus',
}: {
  subjects: Subject[];
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();

  return (
    <Section className="mb-4">
      <SectionHeader title={title} subtitle={subtitle} />
      <View className="gap-1">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            onPress={() => router.push(`/subject/${subject.id}` as any)}
          />
        ))}
      </View>
    </Section>
  );
}
