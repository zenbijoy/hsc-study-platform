import React, { useState } from 'react';
import { View, PanResponder } from 'react-native';
import type { ReaderThemePalette } from '../utils/readerTheme';

export function ReaderProgressBar({
  currentPage,
  totalPages,
  palette,
  onScrubRelease,
}: {
  currentPage: number;
  totalPages: number;
  palette: ReaderThemePalette;
  onScrubRelease: (page: number) => void;
}) {
  const [dragProgress, setDragProgress] = useState<number | null>(null);

  const effectiveProgress =
    dragProgress !== null
      ? dragProgress
      : totalPages > 0
        ? Math.max(0, Math.min(1, currentPage / totalPages))
        : 0;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      const x = Math.max(0, gestureState.x0);
      const ratio = Math.max(0, Math.min(1, x / 300));
      setDragProgress(ratio);
    },
    onPanResponderMove: (evt, gestureState) => {
      const x = Math.max(0, gestureState.moveX);
      const ratio = Math.max(0, Math.min(1, x / 300));
      setDragProgress(ratio);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const x = Math.max(0, gestureState.moveX);
      const ratio = Math.max(0, Math.min(1, x / 300));
      const targetPage = Math.max(1, Math.min(totalPages, Math.round(ratio * totalPages)));
      setDragProgress(null);
      onScrubRelease(targetPage);
    },
  });

  return (
    <View
      {...panResponder.panHandlers}
      style={{
        height: 18,
        justifyContent: 'center',
        paddingHorizontal: 8,
      }}
      className="w-full"
    >
      <View
        style={{
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${Math.round(effectiveProgress * 100)}%`,
            backgroundColor: palette.accent,
            borderRadius: 2,
          }}
        />
      </View>
    </View>
  );
}
