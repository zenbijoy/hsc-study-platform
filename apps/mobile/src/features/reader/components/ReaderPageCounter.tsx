import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/src/components/ui/Typography';
import type { ReaderThemePalette } from '../utils/readerTheme';

export function ReaderPageCounter({
  currentPage,
  totalPages,
  palette,
  onPress,
}: {
  currentPage: number;
  totalPages: number;
  palette: ReaderThemePalette;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Page ${currentPage} of ${totalPages}. Tap to jump to page.`}
      style={{
        backgroundColor: palette.badgeBg,
        borderColor: palette.border,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 5,
      }}
      className="active:opacity-70"
    >
      <AppText
        variant="labelMedium"
        style={{ color: palette.textPrimary, fontWeight: '800' }}
      >
        {currentPage} / {totalPages}
      </AppText>
    </Pressable>
  );
}
