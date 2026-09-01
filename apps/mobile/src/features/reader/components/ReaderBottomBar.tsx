import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReaderPageCounter } from './ReaderPageCounter';
import { ReaderProgressBar } from './ReaderProgressBar';
import type { ReaderThemePalette } from '../utils/readerTheme';

export function ReaderBottomBar({
  currentPage,
  totalPages,
  palette,
  onPreviousPage,
  onNextPage,
  onOpenPageJump,
  onOpenChapters,
  onOpenThumbnails,
  onOpenBookmarks,
  onOpenAppearance,
  onScrubRelease,
}: {
  currentPage: number;
  totalPages: number;
  palette: ReaderThemePalette;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onOpenPageJump: () => void;
  onOpenChapters: () => void;
  onOpenThumbnails: () => void;
  onOpenBookmarks: () => void;
  onOpenAppearance: () => void;
  onScrubRelease: (page: number) => void;
}) {
  return (
    <View
      style={{
        backgroundColor: palette.toolbar,
        borderTopColor: palette.border,
        borderTopWidth: 1,
      }}
      className="px-4 pt-2 pb-5"
    >
      {/* Progress Scrubber */}
      <View className="mb-2">
        <ReaderProgressBar
          currentPage={currentPage}
          totalPages={totalPages}
          palette={palette}
          onScrubRelease={onScrubRelease}
        />
      </View>

      {/* Action Row */}
      <View className="flex-row items-center justify-between">
        {/* Chapters / TOC */}
        <Pressable
          onPress={onOpenChapters}
          accessibilityRole="button"
          accessibilityLabel="Open chapters index"
          className="p-2 active:opacity-60"
        >
          <Ionicons name="list" size={21} color={palette.textPrimary} />
        </Pressable>

        {/* Thumbnails */}
        <Pressable
          onPress={onOpenThumbnails}
          accessibilityRole="button"
          accessibilityLabel="Open page thumbnails"
          className="p-2 active:opacity-60"
        >
          <Ionicons name="grid-outline" size={19} color={palette.textPrimary} />
        </Pressable>

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

        {/* Page Counter & Jump Trigger */}
        <ReaderPageCounter
          currentPage={currentPage}
          totalPages={totalPages}
          palette={palette}
          onPress={onOpenPageJump}
        />

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

        {/* Bookmarks */}
        <Pressable
          onPress={onOpenBookmarks}
          accessibilityRole="button"
          accessibilityLabel="View bookmarks"
          className="p-2 active:opacity-60"
        >
          <Ionicons name="bookmark-outline" size={19} color={palette.textPrimary} />
        </Pressable>

        {/* Appearance / Theme */}
        <Pressable
          onPress={onOpenAppearance}
          accessibilityRole="button"
          accessibilityLabel="Appearance and display settings"
          className="p-2 active:opacity-60"
        >
          <Ionicons name="color-palette-outline" size={19} color={palette.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}
