import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Formula } from '@/src/types/formula.types';
import { FormulaCard } from '@/src/components/domain/FormulaCard';
import { Section, SectionHeader } from '@/src/components/ui/Layout';

export function FormulaOfDaySection({
  formula,
  title = 'Formula of the Day',
  subtitle = 'High-frequency board exam equation',
}: {
  formula: Formula | null;
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  if (!formula) return null;

  return (
    <Section className="mb-4">
      <SectionHeader title={title} subtitle={subtitle} />
      <FormulaCard
        formula={formula}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite(!isFavorite)}
        onPress={() => router.push('/(tabs)/formulas' as any)}
      />
    </Section>
  );
}
