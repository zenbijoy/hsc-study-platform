import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Section, SectionHeader } from '@/src/components/ui/Layout';

export function FormulaRelatedQuestions({
  cqCount = 17,
  mcqCount = 34,
}: {
  cqCount?: number;
  mcqCount?: number;
}) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Section className="mb-4">
      <SectionHeader
        title="Practice & Problem Bank"
        subtitle="Board exam questions requiring this equation"
      />

      <View className="flex-row gap-3">
        {/* CQ Card */}
        <Pressable
          onPress={() => router.push('/(tabs)/practice' as any)}
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: theme.radius.xl,
            padding: 16,
            flex: 1,
          }}
          accessibilityRole="button"
          accessibilityLabel={`Practice ${cqCount} Creative Questions`}
          className="active:opacity-75"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Ionicons name="document-text" size={20} color="#6CB7FF" />
            <AppText variant="headlineMedium" color="sky" style={{ fontWeight: '800' }}>
              {cqCount}
            </AppText>
          </View>
          <AppText variant="titleMedium" color="primary">
            Creative (CQ)
          </AppText>
          <AppText variant="caption" color="muted">
            Board stimulus problems
          </AppText>
        </Pressable>

        {/* MCQ Card */}
        <Pressable
          onPress={() => router.push('/(tabs)/practice' as any)}
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: theme.radius.xl,
            padding: 16,
            flex: 1,
          }}
          accessibilityRole="button"
          accessibilityLabel={`Practice ${mcqCount} Multiple Choice Questions`}
          className="active:opacity-75"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Ionicons name="flash" size={20} color="#57E0B7" />
            <AppText variant="headlineMedium" color="mint" style={{ fontWeight: '800' }}>
              {mcqCount}
            </AppText>
          </View>
          <AppText variant="titleMedium" color="primary">
            MCQ Sprint
          </AppText>
          <AppText variant="caption" color="muted">
            Derivation & speed drills
          </AppText>
        </Pressable>
      </View>
    </Section>
  );
}
