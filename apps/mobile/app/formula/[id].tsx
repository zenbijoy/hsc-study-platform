import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { FormulaDetailsScreen } from '@/src/features/formulas/screens/FormulaDetailsScreen';

export default function FormulaDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <FormulaDetailsScreen formulaId={id || ''} />;
}
