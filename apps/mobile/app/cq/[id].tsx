import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { CQDetailsScreen } from '@/src/features/cq/screens/CQDetailsScreen';

export default function CQDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <CQDetailsScreen cqId={id || ''} />;
}
