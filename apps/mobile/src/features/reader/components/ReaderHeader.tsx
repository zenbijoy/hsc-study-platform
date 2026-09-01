import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/src/components/ui/Typography';
import { ReaderThemePalette } from '../utils/readerTheme';

export function ReaderHeader({
  title,
  chapterTitle,
  palette,
  onBack,
  onOpenSearch,
  onOpenChapters,
  onOpenSettings,
}: {
  title: string;
  chapterTitle?: string;
  palette: ReaderThemePalette;
  onBack: () => void;
  onOpenSearch: () => void;
  onOpenChapters: () => void;
  onOpenSettings: () => void;
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
      {/* Back Button */}
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="p-1 active:opacity-75"
      >
        <Ionicons name="arrow-back" color={palette.textPrimary} size={22} />
      </Pressable>

      {/* Center Title */}
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
          PROTECTED STUDY SESSION
        </AppText>
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onOpenSearch}
          accessibilityRole="button"
          accessibilityLabel="Search textbook"
          className="p-1 active:opacity-75"
        >
          <Ionicons name="search-outline" color={palette.textPrimary} size={19} />
        </Pressable>

        <Pressable
          onPress={onOpenChapters}
          accessibilityRole="button"
          accessibilityLabel="Chapter index"
          className="p-1 active:opacity-75"
        >
          <Ionicons name="list-outline" color={palette.textPrimary} size={21} />
        </Pressable>

        <Pressable
          onPress={onOpenSettings}
          accessibilityRole="button"
          accessibilityLabel="Reader display settings"
          className="p-1 active:opacity-75"
        >
          <Ionicons name="color-palette-outline" color={palette.textPrimary} size={19} />
        </Pressable>
      </View>
    </View>
  );
}
