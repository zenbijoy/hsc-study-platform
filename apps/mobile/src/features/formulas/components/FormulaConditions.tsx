import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Section, SectionHeader } from '@/src/components/ui/Layout';

export function FormulaConditions({
  conditions,
}: {
  conditions?: string[];
}) {
  const theme = useTheme();

  if (!conditions || conditions.length === 0) return null;

  return (
    <Section className="mb-4">
      <SectionHeader
        title="Conditions & Limitations"
        subtitle="Academic assumptions required for this equation to hold"
      />

      <View className="gap-2">
        {conditions.map((cond, idx) => (
          <View
            key={`cond-${idx}`}
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: 'rgba(255, 184, 108, 0.25)',
              borderWidth: 1,
              borderRadius: theme.radius.lg,
              padding: 12,
            }}
            className="flex-row items-center gap-2.5"
          >
            <Ionicons name="alert-circle-outline" size={18} color="#FFB86C" />
            <AppText variant="bodySmall" color="primary" className="flex-1">
              {cond}
            </AppText>
          </View>
        ))}
      </View>
    </Section>
  );
}
