import React, { useMemo } from 'react';
import { View } from 'react-native';
import { AppText } from '@/src/components/ui/Typography';
import { ReaderDisplayMode } from '../types/reader.types';

export function ReaderWatermark({
  sessionId,
  pageNumber,
  displayMode = 'dark',
}: {
  sessionId: string;
  pageNumber: number;
  displayMode?: ReaderDisplayMode;
}) {
  // Deterministically anchor watermark position based on page number
  const positionStyle = useMemo(() => {
    const slot = pageNumber % 4;
    switch (slot) {
      case 0:
        return { top: 80, left: 24 };
      case 1:
        return { top: 80, right: 24 };
      case 2:
        return { bottom: 120, left: 24 };
      case 3:
      default:
        return { bottom: 120, right: 24 };
    }
  }, [pageNumber]);

  const textColor = displayMode === 'original' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)';

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        zIndex: 50,
        ...positionStyle,
      }}
    >
      <AppText
        variant="caption"
        style={{
          color: textColor,
          fontWeight: '800',
          letterSpacing: 2,
          fontSize: 10,
        }}
      >
        HSC STUDY • {sessionId}
      </AppText>
    </View>
  );
}
