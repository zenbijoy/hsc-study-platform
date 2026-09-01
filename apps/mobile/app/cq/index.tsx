import React from 'react';
import { Screen } from '@/components/Screen';
import { CQHubScreen } from '@/src/features/cq/screens/CQHubScreen';

export default function CQHubRoute() {
  return (
    <Screen>
      <CQHubScreen />
    </Screen>
  );
}
