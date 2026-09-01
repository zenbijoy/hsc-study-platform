import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Badge } from '@/src/components/ui/Chip';
import { Section, SectionHeader } from '@/src/components/ui/Layout';
import { useCQDetails } from '../hooks/useCQDetails';
import { CQPartList } from '../components/CQPartList';
import { CQFormulaLinks } from '../components/CQFormulaLinks';
import { CQBookReferences } from '../components/CQBookReferences';

export function CQDetailsScreen({ cqId }: { cqId: string }) {
  const theme = useTheme();
  const router = useRouter();
  const {
    cq,
    isLoading,
    isSaved,
    toggleSave,
    revealedParts,
    toggleRevealPart,
    revealAllAnswers,
  } = useCQDetails(cqId);

  if (isLoading || !cq) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }} className="items-center justify-center">
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="p-2 -ml-2 active:opacity-60"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </Pressable>

        <View className="flex-1 items-center px-2">
          <AppText variant="caption" color="muted" numberOfLines={1}>
            {cq.subjectName} • {cq.chapterTitle}
          </AppText>
        </View>

        <Pressable
          onPress={toggleSave}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Remove saved question' : 'Save question'}
          className="p-2 -mr-2 active:opacity-60"
        >
          <Ionicons
            name={isSaved ? 'star' : 'star-outline'}
            size={24}
            color={isSaved ? '#FFB86C' : theme.colors.textPrimary}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Badges */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <Badge label={cq.board ? `${cq.board} ${cq.year}` : 'BOARD QUESTION'} variant="primary" />
            <Badge label={`${cq.totalMarks} MARKS`} variant="neutral" />
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={14} color="#FFB86C" />
            <AppText variant="caption" color="secondary" style={{ fontWeight: '700' }}>
              Importance {cq.importance}/5
            </AppText>
          </View>
        </View>

        {/* Title */}
        <AppText variant="headlineLarge" color="primary" style={{ fontWeight: '800' }}>
          {cq.title}
        </AppText>

        {/* Stimulus Box */}
        <Section className="my-4">
          <SectionHeader title="Question Stimulus (উদ্দীপক)" />
          <View
            style={{
              backgroundColor: '#05090D',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              borderRadius: theme.radius.xl,
              padding: 18,
            }}
          >
            <AppText variant="bodyMedium" color="primary" className="leading-7 font-medium">
              {cq.stimulus}
            </AppText>
          </View>
        </Section>

        {/* Sub-Questions & Solutions */}
        <CQPartList
          subQuestions={cq.subQuestions}
          revealedParts={revealedParts}
          onToggleRevealPart={toggleRevealPart}
          onRevealAll={revealAllAnswers}
        />

        {/* Required Formulas */}
        <CQFormulaLinks formulas={cq.formulaReferences} />

        {/* Textbook References */}
        <CQBookReferences bookReferences={cq.bookReferences} />
      </ScrollView>
    </View>
  );
}
