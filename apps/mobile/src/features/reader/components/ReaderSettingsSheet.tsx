import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Chip } from '@/src/components/ui/Chip';
import { ReaderDisplayMode, ReaderPageDirection } from '../types/reader.types';

const THEME_OPTIONS: { id: ReaderDisplayMode; label: string; previewBg: string; previewText: string }[] = [
  { id: 'dark', label: 'Dark', previewBg: '#05090D', previewText: '#FFFFFF' },
  { id: 'sepia', label: 'Sepia', previewBg: '#1C1712', previewText: '#F5E6D3' },
  { id: 'midnight', label: 'Midnight', previewBg: '#081018', previewText: '#E2F1FF' },
  { id: 'original', label: 'Original', previewBg: '#FFFFFF', previewText: '#0F172A' },
];

export function ReaderSettingsSheet({
  visible,
  onClose,
  displayMode,
  onChangeDisplayMode,
  pageDirection,
  onChangePageDirection,
}: {
  visible: boolean;
  onClose: () => void;
  displayMode: ReaderDisplayMode;
  onChangeDisplayMode: (mode: ReaderDisplayMode) => void;
  pageDirection: ReaderPageDirection;
  onChangePageDirection: (dir: ReaderPageDirection) => void;
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
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-white/10 mb-4">
            <AppText variant="titleLarge" color="primary" style={{ fontWeight: '800' }}>
              Reader Display Settings
            </AppText>
            <Ionicons name="close" size={22} color={theme.colors.textMuted} onPress={onClose} />
          </View>

          {/* Color Themes */}
          <AppText variant="labelMedium" color="primary" className="mb-2 font-bold">
            Page Theme & Eye Comfort
          </AppText>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {THEME_OPTIONS.map((t) => {
              const isSelected = displayMode === t.id;

              return (
                <Pressable
                  key={t.id}
                  onPress={() => onChangeDisplayMode(t.id)}
                  style={{
                    backgroundColor: t.previewBg,
                    borderColor: isSelected ? theme.colors.primary : 'rgba(255,255,255,0.15)',
                    borderWidth: isSelected ? 2 : 1,
                    borderRadius: theme.radius.lg,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    minWidth: '47%',
                    alignItems: 'center',
                  }}
                  className="active:opacity-75"
                >
                  <AppText
                    variant="labelMedium"
                    style={{ color: t.previewText, fontWeight: isSelected ? '800' : '600' }}
                  >
                    {t.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {/* Page Scrolling Direction */}
          <AppText variant="labelMedium" color="primary" className="mb-2 font-bold">
            Reading Scroll Mode
          </AppText>
          <View className="flex-row gap-2 mb-4">
            <Chip
              label="Vertical Scroll ↕️"
              selected={pageDirection === 'vertical'}
              onPress={() => onChangePageDirection('vertical')}
            />
            <Chip
              label="Horizontal Page Flip ↔️"
              selected={pageDirection === 'horizontal'}
              onPress={() => onChangePageDirection('horizontal')}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
