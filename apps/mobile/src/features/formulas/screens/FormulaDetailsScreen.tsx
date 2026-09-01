import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { AppText } from '@/src/components/ui/Typography';
import { Badge } from '@/src/components/ui/Chip';
import { Section, SectionHeader } from '@/src/components/ui/Layout';
import { useFormulaDetails } from '../hooks/useFormulaDetails';
import { FormulaVariablesTable } from '../components/FormulaVariablesTable';
import { FormulaConditions } from '../components/FormulaConditions';
import { FormulaRelatedBooks } from '../components/FormulaRelatedBooks';
import { FormulaRelatedQuestions } from '../components/FormulaRelatedQuestions';

export function FormulaDetailsScreen({ formulaId }: { formulaId: string }) {
  const theme = useTheme();
  const router = useRouter();
  const { formula, isLoading, isSaved, toggleSave } = useFormulaDetails(formulaId);

  if (isLoading || !formula) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }} className="items-center justify-center">
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  const subTheme = resolveSubjectTheme(formula.subjectId);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Top Header */}
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
            {formula.subjectName} • {formula.chapterTitle}
          </AppText>
        </View>

        <Pressable
          onPress={toggleSave}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Remove saved formula' : 'Save formula'}
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
        {/* Subject & Importance Badges */}
        <View className="flex-row items-center justify-between mb-3">
          <Badge label={formula.subjectId.toUpperCase()} variant="primary" />
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={14} color="#FFB86C" />
            <AppText variant="caption" color="secondary" style={{ fontWeight: '700' }}>
              Importance {formula.importance}/5
            </AppText>
          </View>
        </View>

        {/* Title */}
        <AppText variant="headlineLarge" color="primary" style={{ fontWeight: '800' }}>
          {formula.titleBn}
        </AppText>
        {formula.titleEn && (
          <AppText variant="titleMedium" color="muted" className="mt-0.5 mb-4">
            {formula.titleEn}
          </AppText>
        )}

        {/* Big Equation Hero Box */}
        <View
          style={{
            backgroundColor: '#05090D',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            borderRadius: theme.radius.xl,
            paddingVertical: 24,
            paddingHorizontal: 20,
          }}
          className="items-center justify-center mb-6 shadow-xl"
        >
          <AppText
            variant="display"
            style={{ color: subTheme.primary, fontFamily: 'monospace', fontWeight: '800' }}
          >
            {formula.latex}
          </AppText>
        </View>

        {/* Concept Explanation */}
        {formula.explanationBn && (
          <Section className="mb-4">
            <SectionHeader title="Concept Overview" />
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.lg,
                padding: 14,
              }}
            >
              <AppText variant="bodyMedium" color="primary" className="leading-6">
                {formula.explanationBn}
              </AppText>
            </View>
          </Section>
        )}

        {/* Variables Table */}
        <FormulaVariablesTable variables={formula.variables} />

        {/* Conditions */}
        <FormulaConditions conditions={formula.conditions} />

        {/* Read in Textbooks Deep-Link */}
        <FormulaRelatedBooks bookReferences={formula.knowledgeLinks?.bookReferences} />

        {/* Practice Board Questions */}
        <FormulaRelatedQuestions
          cqCount={formula.knowledgeLinks?.cqCount}
          mcqCount={formula.knowledgeLinks?.mcqCount}
        />
      </ScrollView>
    </View>
  );
}
