import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Formula } from '@/src/types/formula.types';
import { Section, SectionHeader } from '@/src/components/ui/Layout';
import { FormulaCard } from '@/src/components/domain/FormulaCard';

export function ImportantFormulaPreview({
  formulas,
}: {
  formulas: Formula[];
}) {
  const router = useRouter();
  const [favoriteIds, setFavoriteIds] = useState<Record<string, boolean>>({});

  if (!formulas || formulas.length === 0) return null;

  return (
    <Section className="mb-4">
      <SectionHeader
        title="Key Subject Formulas"
        subtitle="High-yield equations frequently tested in board exams"
      />
      <View className="gap-2">
        {formulas.map((formula) => (
          <FormulaCard
            key={formula.id}
            formula={formula}
            isFavorite={favoriteIds[formula.id] || false}
            onToggleFavorite={() =>
              setFavoriteIds((prev) => ({
                ...prev,
                [formula.id]: !prev[formula.id],
              }))
            }
            onPress={() => router.push('/(tabs)/formulas' as any)}
          />
        ))}
      </View>
    </Section>
  );
}
