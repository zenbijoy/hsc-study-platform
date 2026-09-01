import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Section, SectionHeader } from '@/src/components/ui/Layout';
import { CQPart } from '../types/cq.types';

export function CQPartList({
  subQuestions,
  revealedParts,
  onToggleRevealPart,
  onRevealAll,
}: {
  subQuestions: CQPart[];
  revealedParts: Record<string, boolean>;
  onToggleRevealPart: (partId: string) => void;
  onRevealAll: () => void;
}) {
  const theme = useTheme();

  return (
    <Section className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <SectionHeader
          title="Question Parts & Solutions"
          subtitle="Sub-questions (ক, খ, গ, ঘ) with step-by-step marking rubrics"
        />
        <Pressable
          onPress={onRevealAll}
          style={{
            backgroundColor: 'rgba(87, 224, 183, 0.15)',
            borderRadius: theme.radius.md,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
          className="active:opacity-75"
        >
          <AppText variant="caption" color="mint" style={{ fontWeight: '800' }}>
            Reveal All Solutions
          </AppText>
        </Pressable>
      </View>

      <View className="gap-3">
        {subQuestions.map((part) => {
          const isRevealed = Boolean(revealedParts[part.id]);

          return (
            <View
              key={part.id}
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.xl,
                overflow: 'hidden',
              }}
            >
              {/* Question Part Row */}
              <View className="p-4">
                <View className="flex-row items-center justify-between mb-1.5">
                  <View className="flex-row items-center gap-2">
                    <View
                      style={{
                        backgroundColor: 'rgba(87, 224, 183, 0.2)',
                        borderRadius: theme.radius.sm,
                        width: 26,
                        height: 26,
                      }}
                      className="items-center justify-center"
                    >
                      <AppText variant="caption" color="mint" style={{ fontWeight: '800' }}>
                        {part.banglaLetter}
                      </AppText>
                    </View>
                    <AppText variant="labelLarge" color="primary">
                      প্রশ্ন ({part.banglaLetter})
                    </AppText>
                  </View>

                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: theme.radius.sm,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <AppText variant="caption" color="secondary" style={{ fontWeight: '700' }}>
                      {part.marks} Mark{part.marks > 1 ? 's' : ''}
                    </AppText>
                  </View>
                </View>

                <AppText variant="bodyMedium" color="primary" className="leading-6">
                  {part.question}
                </AppText>

                {/* Solution Reveal Trigger */}
                {part.solution && (
                  <Pressable
                    onPress={() => onToggleRevealPart(part.id)}
                    style={{
                      backgroundColor: isRevealed ? 'rgba(255, 255, 255, 0.04)' : theme.colors.primary,
                      borderRadius: theme.radius.md,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      marginTop: 12,
                    }}
                    className="flex-row items-center justify-between active:opacity-85"
                  >
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons
                        name={isRevealed ? 'chevron-up' : 'bulb'}
                        size={16}
                        color={isRevealed ? theme.colors.textSecondary : '#071018'}
                      />
                      <AppText
                        variant="caption"
                        style={{
                          color: isRevealed ? theme.colors.textSecondary : '#071018',
                          fontWeight: '800',
                        }}
                      >
                        {isRevealed ? 'Hide Solution' : 'View Step Solution'}
                      </AppText>
                    </View>

                    <Ionicons
                      name={isRevealed ? 'eye-off-outline' : 'arrow-forward'}
                      size={14}
                      color={isRevealed ? theme.colors.textSecondary : '#071018'}
                    />
                  </Pressable>
                )}
              </View>

              {/* Solution Accordion Body */}
              {isRevealed && part.solution && (
                <View
                  style={{
                    backgroundColor: '#05090D',
                    borderTopColor: theme.colors.border,
                    borderTopWidth: 1,
                    padding: 16,
                  }}
                >
                  <View className="flex-row items-center gap-1.5 mb-2">
                    <Ionicons name="checkmark-circle" size={16} color="#57E0B7" />
                    <AppText variant="caption" color="mint" style={{ fontWeight: '800' }}>
                      OFFICIAL SOLUTION & MARKING SCHEME
                    </AppText>
                  </View>

                  <AppText variant="bodyMedium" color="secondary" className="leading-6 font-mono">
                    {part.solution}
                  </AppText>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </Section>
  );
}
