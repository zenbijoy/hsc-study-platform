import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Badge } from '@/src/components/ui/Chip';
import { useCQPractice } from '../hooks/useCQPractice';
import { CanonicalCQ } from '../types/cq.types';

export function CQPracticeScreen({
  questions,
  onClose,
}: {
  questions: CanonicalCQ[];
  onClose: () => void;
}) {
  const theme = useTheme();
  const {
    currentQuestion,
    currentIndex,
    totalCount,
    isSolutionRevealed,
    toggleRevealSolution,
    rateQuestion,
    isFinished,
    restart,
  } = useCQPractice(questions);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }} className="px-4 pt-4">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between pb-3 border-b border-white/10">
        <View>
          <AppText variant="caption" color="sky" style={{ fontWeight: '800', letterSpacing: 1.5 }}>
            EXAM PRACTICE MODE
          </AppText>
          <AppText variant="titleMedium" color="primary" style={{ fontWeight: '800' }}>
            Board CQ Drill
          </AppText>
        </View>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close practice"
          className="p-2 -mr-2 active:opacity-60"
        >
          <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
        </Pressable>
      </View>

      {/* Completion View */}
      {isFinished ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="trophy" size={64} color="#57E0B7" />
          <AppText variant="headlineMedium" color="primary" className="mt-4 text-center font-bold">
            CQ Drill Completed! 🎓
          </AppText>
          <AppText variant="bodyMedium" color="secondary" className="mt-2 text-center">
            You practiced {totalCount} Creative Questions.
          </AppText>
          <View className="flex-row gap-3 mt-8 w-full">
            <Pressable
              onPress={restart}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.lg,
                paddingVertical: 14,
              }}
              className="flex-1 items-center justify-center active:opacity-75"
            >
              <AppText variant="labelLarge" color="secondary">
                Restart Session
              </AppText>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.lg,
                paddingVertical: 14,
              }}
              className="flex-1 items-center justify-center active:opacity-85"
            >
              <AppText variant="labelLarge" style={{ color: '#071018', fontWeight: '800' }}>
                Done
              </AppText>
            </Pressable>
          </View>
        </View>
      ) : currentQuestion ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16, paddingBottom: 100 }}
        >
          {/* Header Progress */}
          <View className="flex-row items-center justify-between mb-3">
            <Badge label={currentQuestion.board ? `${currentQuestion.board} ${currentQuestion.year}` : 'PRACTICE CQ'} variant="primary" />
            <AppText variant="caption" color="mint" style={{ fontWeight: '800' }}>
              Question {currentIndex + 1} of {totalCount}
            </AppText>
          </View>

          {/* Stimulus */}
          <View
            style={{
              backgroundColor: '#05090D',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              borderRadius: theme.radius.xl,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <AppText variant="caption" color="muted" className="mb-1 font-bold">
              STIMULUS (উদ্দীপক)
            </AppText>
            <AppText variant="bodyMedium" color="primary" className="leading-6">
              {currentQuestion.stimulus}
            </AppText>
          </View>

          {/* Sub-Questions */}
          <View className="gap-2 mb-4">
            {currentQuestion.subQuestions.map((q) => (
              <View
                key={q.id}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                  borderRadius: theme.radius.lg,
                  padding: 12,
                }}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <AppText variant="caption" color="mint" style={{ fontWeight: '800' }}>
                    প্রশ্ন ({q.banglaLetter})
                  </AppText>
                  <AppText variant="caption" color="muted">
                    {q.marks} Marks
                  </AppText>
                </View>
                <AppText variant="bodyMedium" color="primary">
                  {q.question}
                </AppText>
              </View>
            ))}
          </View>

          {/* Solution Reveal & Rating Controls */}
          {isSolutionRevealed ? (
            <View
              style={{
                backgroundColor: '#05090D',
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.xl,
                padding: 16,
              }}
              className="my-3"
            >
              <AppText variant="caption" color="mint" style={{ fontWeight: '800' }} className="mb-2">
                STEP-BY-STEP SOLUTION
              </AppText>
              {currentQuestion.subQuestions.map((q) => (
                <View key={`sol-${q.id}`} className="mb-3">
                  <AppText variant="caption" color="sky" style={{ fontWeight: '800' }}>
                    ({q.banglaLetter}) উত্তর:
                  </AppText>
                  <AppText variant="bodyMedium" color="secondary" className="leading-6 font-mono">
                    {q.solution || 'সমাধান প্রক্রিয়া সম্পন্ন হয়েছে।'}
                  </AppText>
                </View>
              ))}

              <View className="flex-row gap-3 mt-4 pt-3 border-t border-white/10">
                <Pressable
                  onPress={() => rateQuestion('need_review')}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: theme.radius.lg,
                    paddingVertical: 12,
                  }}
                  className="flex-1 items-center justify-center active:opacity-75"
                >
                  <AppText variant="labelLarge" color="secondary">
                    Need Review ⏳
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={() => rateQuestion('got_it')}
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radius.lg,
                    paddingVertical: 12,
                  }}
                  className="flex-1 items-center justify-center active:opacity-85"
                >
                  <AppText variant="labelLarge" style={{ color: '#071018', fontWeight: '800' }}>
                    Got It! ✅
                  </AppText>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={toggleRevealSolution}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.lg,
                paddingVertical: 14,
              }}
              className="w-full items-center justify-center active:opacity-85 my-3"
            >
              <AppText variant="labelLarge" style={{ color: '#071018', fontWeight: '800' }}>
                Reveal Step Solution & Self-Rate
              </AppText>
            </Pressable>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
}
