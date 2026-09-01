import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import { Section, SectionHeader } from '@/src/components/ui/Layout';
import { CQFormulaReference } from '../types/cq.types';

export function CQFormulaLinks({
  formulas,
}: {
  formulas?: CQFormulaReference[];
}) {
  const theme = useTheme();
  const router = useRouter();

  if (!formulas || formulas.length === 0) return null;

  return (
    <Section className="mb-4">
      <SectionHeader
        title="Required Formulas"
        subtitle="Mathematical formulas needed to solve this problem"
      />

      <View className="gap-2">
        {formulas.map((f) => (
          <Card
            key={f.id}
            variant="interactive"
            onPress={() => router.push(`/formula/${f.id}` as any)}
            accessibilityLabel={`Open formula ${f.title}`}
            className="p-3.5"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <AppText variant="caption" color="muted">
                  {f.title}
                </AppText>
                <AppText variant="titleMedium" color="mint" style={{ fontFamily: 'monospace', fontWeight: '800' }}>
                  {f.latex}
                </AppText>
              </View>

              <View
                style={{
                  backgroundColor: 'rgba(87, 224, 183, 0.15)',
                  borderRadius: theme.radius.sm,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
                className="flex-row items-center gap-1"
              >
                <AppText variant="caption" color="mint" style={{ fontWeight: '800' }}>
                  Formula
                </AppText>
                <Ionicons name="arrow-forward" size={12} color={theme.colors.primary} />
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Section>
  );
}
