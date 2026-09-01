import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { LibrarySortOption } from '../types/library.types';

const SORT_OPTIONS: { id: LibrarySortOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'recommended', label: 'Recommended for You', icon: 'sparkles-outline' },
  { id: 'recently_added', label: 'Recently Added', icon: 'time-outline' },
  { id: 'title_asc', label: 'Title: A to Z', icon: 'text-outline' },
  { id: 'title_desc', label: 'Title: Z to A', icon: 'text-outline' },
  { id: 'progress', label: 'Reading Progress', icon: 'trending-up-outline' },
  { id: 'downloaded_first', label: 'Downloaded Books First', icon: 'cloud-done-outline' },
];

export function LibrarySortSheet({
  visible,
  onClose,
  selectedSort,
  onSelectSort,
}: {
  visible: boolean;
  onClose: () => void;
  selectedSort: LibrarySortOption;
  onSelectSort: (opt: LibrarySortOption) => void;
}) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
        className="flex-1 justify-end"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.colors.surfaceElevated,
            borderTopLeftRadius: theme.radius.xxl,
            borderTopRightRadius: theme.radius.xxl,
            padding: 20,
          }}
        >
          <View className="flex-row items-center justify-between pb-3 border-b border-white/10 mb-2">
            <AppText variant="titleLarge" color="primary" style={{ fontWeight: '800' }}>
              Sort Books
            </AppText>
            <Ionicons name="close" size={22} color={theme.colors.textMuted} onPress={onClose} />
          </View>

          <View className="gap-1 my-2">
            {SORT_OPTIONS.map((opt) => {
              const isSelected = selectedSort === opt.id;

              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    onSelectSort(opt.id);
                    onClose();
                  }}
                  style={{
                    backgroundColor: isSelected ? 'rgba(87, 224, 183, 0.12)' : 'transparent',
                    borderRadius: theme.radius.lg,
                    padding: 14,
                  }}
                  className="flex-row items-center justify-between active:opacity-75"
                >
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <AppText
                      variant="bodyMedium"
                      style={{
                        color: isSelected ? theme.colors.primary : theme.colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      }}
                    >
                      {opt.label}
                    </AppText>
                  </View>

                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
