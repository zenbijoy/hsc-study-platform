import React from 'react';
import { Modal, Pressable, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Chip } from '@/src/components/ui/Chip';
import type { ReaderDisplayMode, ReaderPageDirection, ReaderSettings } from '../types/reader.types';

const THEME_PREVIEWS: { id: ReaderDisplayMode; label: string; previewBg: string; previewText: string }[] = [
  { id: 'dark', label: 'Dark (AMOLED)', previewBg: '#05090D', previewText: '#FFFFFF' },
  { id: 'sepia', label: 'Sepia (Warm Paper)', previewBg: '#1C1712', previewText: '#F5E6D3' },
  { id: 'midnight', label: 'Midnight (Deep Blue)', previewBg: '#081018', previewText: '#E2F1FF' },
  { id: 'original', label: 'Original (Day)', previewBg: '#FFFFFF', previewText: '#0F172A' },
];

export function ReaderAppearanceSheet({
  visible,
  onClose,
  settings,
  onChangeDisplayMode,
  onChangePageDirection,
  onChangeBrightness,
  onToggleKeepScreenAwake,
}: {
  visible: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onChangeDisplayMode: (mode: ReaderDisplayMode) => void;
  onChangePageDirection: (dir: ReaderPageDirection) => void;
  onChangeBrightness: (b: number) => void;
  onToggleKeepScreenAwake: (keep: boolean) => void;
}) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} className="flex-1 justify-end">
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
              Reader Appearance & Display
            </AppText>
            <Ionicons name="close" size={22} color={theme.colors.textMuted} onPress={onClose} />
          </View>

          {/* Color Themes */}
          <AppText variant="labelMedium" color="primary" className="mb-2 font-bold">
            Eye Comfort & Page Tone
          </AppText>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {THEME_PREVIEWS.map((t) => {
              const isSelected = settings.displayMode === t.id;

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
          <View className="flex-row gap-2 mb-5">
            <Chip
              label="Vertical Continuous ↕️"
              selected={settings.pageDirection === 'vertical'}
              onPress={() => onChangePageDirection('vertical')}
            />
            <Chip
              label="Horizontal Page Flip ↔️"
              selected={settings.pageDirection === 'horizontal'}
              onPress={() => onChangePageDirection('horizontal')}
            />
          </View>

          {/* In-App Dimming / Brightness */}
          <AppText variant="labelMedium" color="primary" className="mb-2 font-bold">
            In-App Page Dimming ({Math.round(settings.brightness * 100)}%)
          </AppText>
          <View className="flex-row gap-2 mb-5">
            <Chip
              label="100% (Normal)"
              selected={settings.brightness >= 0.95}
              onPress={() => onChangeBrightness(1.0)}
            />
            <Chip
              label="80% (Soft)"
              selected={settings.brightness >= 0.75 && settings.brightness < 0.95}
              onPress={() => onChangeBrightness(0.8)}
            />
            <Chip
              label="60% (Dim)"
              selected={settings.brightness < 0.75}
              onPress={() => onChangeBrightness(0.6)}
            />
          </View>

          {/* Keep Screen Awake Toggle */}
          <View className="flex-row items-center justify-between pt-2 border-t border-white/10">
            <View className="flex-1 pr-3">
              <AppText variant="titleMedium" color="primary">
                Keep Screen Awake
              </AppText>
              <AppText variant="caption" color="muted">
                Prevents display sleep during long study sessions
              </AppText>
            </View>
            <Switch
              value={settings.keepScreenAwake}
              onValueChange={onToggleKeepScreenAwake}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
