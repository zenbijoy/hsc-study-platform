import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/src/components/ui/Typography';
import type { ReaderThemePalette } from '../utils/readerTheme';

export function ReaderTopBar({
  title,
  chapterTitle,
  isBookmarked,
  palette,
  canGoBackLocation,
  onBack,
  onGoBackLocation,
  onToggleBookmark,
  onOpenSearch,
  onOpenContextTools,
  onOpenMore,
}: {
  title: string;
  chapterTitle?: string;
  isBookmarked: boolean;
  palette: ReaderThemePalette;
  canGoBackLocation?: boolean;
  onBack: () => void;
  onGoBackLocation?: () => void;
  onToggleBookmark: () => void;
  onOpenSearch: () => void;
  onOpenContextTools: () => void;
  onOpenMore: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: palette.toolbar,
        borderBottomColor: palette.border,
        borderBottomWidth: 1,
      }}
      className="flex-row items-center justify-between px-4 pb-3 pt-12"
    >
      {/* Back Button and Location History Back */}
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Close reader"
          className="p-1 active:opacity-70"
        >
          <Ionicons name="arrow-back" color={palette.textPrimary} size={22} />
        </Pressable>

        {canGoBackLocation && onGoBackLocation && (
          <Pressable
            onPress={onGoBackLocation}
            accessibilityRole="button"
            accessibilityLabel="Back to previous location"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <Ionicons name="return-up-back" size={14} color={palette.accent} />
            <AppText variant="caption" style={{ color: palette.accent, fontWeight: '700', fontSize: 10 }}>
              Return
            </AppText>
          </Pressable>
        )}
      </View>

      {/* Chapter / Book Title */}
      <View className="items-center flex-1 px-3">
        <AppText
          variant="titleMedium"
          style={{ color: palette.textPrimary, fontWeight: '700' }}
          numberOfLines={1}
        >
          {chapterTitle || title}
        </AppText>
        <AppText
          variant="caption"
          style={{ color: palette.accent, fontSize: 9, fontWeight: '800', letterSpacing: 1 }}
        >
          HSC SECURE STUDY
        </AppText>
      </View>

      {/* Top Actions */}
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onOpenSearch}
          accessibilityRole="button"
          accessibilityLabel="Search this book"
          className="p-1 active:opacity-70"
        >
          <Ionicons name="search-outline" color={palette.textPrimary} size={20} />
        </Pressable>

        <Pressable
          onPress={onToggleBookmark}
          accessibilityRole="button"
          accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
          className="p-1 active:opacity-70"
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            color={isBookmarked ? palette.accent : palette.textPrimary}
            size={20}
          />
        </Pressable>

        <Pressable
          onPress={onOpenContextTools}
          accessibilityRole="button"
          accessibilityLabel="Study tools and formulas"
          className="p-1 active:opacity-70"
        >
          <Ionicons name="flash-outline" color={palette.textPrimary} size={19} />
        </Pressable>

        <Pressable
          onPress={onOpenMore}
          accessibilityRole="button"
          accessibilityLabel="More options"
          className="p-1 active:opacity-70"
        >
          <Ionicons name="ellipsis-vertical" color={palette.textPrimary} size={19} />
        </Pressable>
      </View>
    </View>
  );
}
