import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { IconButton } from '@/src/components/ui/IconButton';
import { LibrarySortOption, LibraryViewMode } from '../types/library.types';

export function LibraryHeader({
  viewMode,
  onToggleViewMode,
  activeFilterCount,
  onOpenFilterSheet,
  sortOption,
  onOpenSortSheet,
}: {
  viewMode: LibraryViewMode;
  onToggleViewMode: () => void;
  activeFilterCount: number;
  onOpenFilterSheet: () => void;
  sortOption: LibrarySortOption;
  onOpenSortSheet: () => void;
}) {
  const theme = useTheme();

  return (
    <View className="flex-row items-center justify-between py-3 mb-1">
      <View>
        <AppText variant="headlineMedium" color="primary" style={{ fontWeight: '800' }}>
          Study Library
        </AppText>
        <AppText variant="caption" color="muted">
          All your HSC textbooks in one place
        </AppText>
      </View>

      <View className="flex-row items-center gap-2">
        {/* View Mode Toggle */}
        <IconButton
          name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
          variant="surface"
          size="sm"
          onPress={onToggleViewMode}
          accessibilityLabel={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
        />

        {/* Sort Button */}
        <IconButton
          name="swap-vertical-outline"
          variant="surface"
          size="sm"
          onPress={onOpenSortSheet}
          accessibilityLabel="Sort books"
        />

        {/* Filter Button with Badge */}
        <Pressable
          onPress={onOpenFilterSheet}
          style={{
            backgroundColor: activeFilterCount > 0 ? 'rgba(87, 224, 183, 0.15)' : theme.colors.surface,
            borderColor: activeFilterCount > 0 ? theme.colors.primary : theme.colors.border,
            borderWidth: 1,
            borderRadius: theme.radius.full,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
          accessibilityRole="button"
          accessibilityLabel="Filter books"
          className="flex-row items-center gap-1.5 active:opacity-75"
        >
          <Ionicons
            name="options-outline"
            size={16}
            color={activeFilterCount > 0 ? theme.colors.primary : theme.colors.textPrimary}
          />
          {activeFilterCount > 0 ? (
            <AppText variant="caption" color="mint" style={{ fontWeight: '700' }}>
              {activeFilterCount}
            </AppText>
          ) : (
            <AppText variant="caption" color="primary">
              Filter
            </AppText>
          )}
        </Pressable>
      </View>
    </View>
  );
}
