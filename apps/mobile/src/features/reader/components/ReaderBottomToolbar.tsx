import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/src/components/ui/Typography';
import { ReaderThemePalette } from '../utils/readerTheme';

export function ReaderBottomToolbar({
  currentPage,
  totalPages,
  isBookmarked,
  palette,
  onPreviousPage,
  onNextPage,
  onToggleBookmark,
  onOpenChapters,
}: {
  currentPage: number;
  totalPages: number;
  isBookmarked: boolean;
  palette: ReaderThemePalette;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onToggleBookmark: () => void;
  onOpenChapters: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: palette.toolbar,
        borderTopColor: palette.border,
        borderTopWidth: 1,
      }}
      className="flex-row items-center justify-around px-4 py-3"
    >
      {/* Previous Page */}
      <Pressable
        onPress={onPreviousPage}
        disabled={currentPage <= 1}
        accessibilityRole="button"
        accessibilityLabel="Previous page"
        className="p-2 active:opacity-60"
      >
        <Ionicons
          name="chevron-back"
          size={22}
          color={currentPage <= 1 ? palette.textMuted : palette.textPrimary}
        />
      </Pressable>

      {/* Bookmark Button */}
      <Pressable
        onPress={onToggleBookmark}
        accessibilityRole="button"
        accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
        className="p-2 active:opacity-60"
      >
        <Ionicons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={isBookmarked ? palette.accent : palette.textPrimary}
        />
      </Pressable>

      {/* Page Counter Badge */}
      <View
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 5,
        }}
      >
        <AppText
          variant="labelMedium"
          style={{ color: palette.textPrimary, fontWeight: '800' }}
        >
          {currentPage} / {totalPages}
        </AppText>
      </View>

      {/* Chapter Index Trigger */}
      <Pressable
        onPress={onOpenChapters}
        accessibilityRole="button"
        accessibilityLabel="Open chapters"
        className="p-2 active:opacity-60"
      >
        <Ionicons name="book-outline" size={20} color={palette.textPrimary} />
      </Pressable>

      {/* Next Page */}
      <Pressable
        onPress={onNextPage}
        disabled={currentPage >= totalPages}
        accessibilityRole="button"
        accessibilityLabel="Next page"
        className="p-2 active:opacity-60"
      >
        <Ionicons
          name="chevron-forward"
          size={22}
          color={currentPage >= totalPages ? palette.textMuted : palette.textPrimary}
        />
      </Pressable>
    </View>
  );
}
