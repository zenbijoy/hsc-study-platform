import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { AppText } from '@/src/components/ui/Typography';
import { Section, SectionHeader } from '@/src/components/ui/Layout';

export function RelatedStudyTools({
  bookId,
  subjectId,
}: {
  bookId: string;
  subjectId: string;
}) {
  const theme = useTheme();
  const router = useRouter();
  const subTheme = resolveSubjectTheme(subjectId);

  const tools: {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
  }[] = [
    {
      id: 'formulas',
      label: 'Formula Vault',
      icon: 'calculator-outline',
      route: '/(tabs)/formulas',
    },
    {
      id: 'cqs',
      label: 'Board CQs',
      icon: 'document-text-outline',
      route: '/(tabs)/practice',
    },
    {
      id: 'mcqs',
      label: 'MCQ Practice',
      icon: 'flash-outline',
      route: '/(tabs)/practice',
    },
  ];

  return (
    <Section className="mb-4">
      <SectionHeader
        title="Study This Book"
        subtitle="Connected formulas, creative questions, and MCQ drills"
      />

      <View className="flex-row gap-2.5">
        {tools.map((tool) => (
          <Pressable
            key={tool.id}
            onPress={() => router.push(tool.route as any)}
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: theme.radius.lg,
              padding: 12,
              flex: 1,
              alignItems: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel={tool.label}
            className="active:opacity-75"
          >
            <View
              style={{
                backgroundColor: subTheme.tintBg,
                borderRadius: theme.radius.md,
                width: 38,
                height: 38,
              }}
              className="items-center justify-center mb-2"
            >
              <Ionicons name={tool.icon} size={20} color={subTheme.primary} />
            </View>
            <AppText variant="labelMedium" color="primary" style={{ fontSize: 11 }}>
              {tool.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </Section>
  );
}
