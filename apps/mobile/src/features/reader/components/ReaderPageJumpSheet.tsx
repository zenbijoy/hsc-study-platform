import React, { useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Button } from '@/src/components/ui/Button';
import { clampPage } from '../utils/pageNavigation';

export function ReaderPageJumpSheet({
  visible,
  onClose,
  currentPage,
  totalPages,
  onJumpToPage,
}: {
  visible: boolean;
  onClose: () => void;
  currentPage: number;
  totalPages: number;
  onJumpToPage: (page: number) => void;
}) {
  const theme = useTheme();
  const [inputPage, setInputPage] = useState(String(currentPage));

  const handleJump = () => {
    const parsed = parseInt(inputPage.trim(), 10);
    if (!Number.isNaN(parsed)) {
      const clamped = clampPage(parsed, totalPages);
      onJumpToPage(clamped);
      onClose();
    }
  };

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
              পৃষ্ঠা নম্বরে যান (Go to Page)
            </AppText>
            <Ionicons name="close" size={22} color={theme.colors.textMuted} onPress={onClose} />
          </View>

          {/* Quick Jump Input */}
          <View className="items-center mb-6">
            <AppText variant="bodyMedium" color="muted" className="mb-3 text-center">
              ১ থেকে {totalPages}-এর মধ্যে যেকোনো পৃষ্ঠা নম্বর লিখুন
            </AppText>

            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 2,
                borderRadius: theme.radius.xl,
                paddingHorizontal: 24,
                paddingVertical: 12,
                minWidth: 140,
                alignItems: 'center',
              }}
            >
              <TextInput
                value={inputPage}
                onChangeText={setInputPage}
                keyboardType="numeric"
                autoFocus
                selectTextOnFocus
                style={{
                  color: theme.colors.primary,
                  fontSize: 28,
                  fontWeight: '800',
                  textAlign: 'center',
                }}
              />
            </View>
          </View>

          {/* Quick Increment/Decrement helpers */}
          <View className="flex-row justify-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onPress={() => setInputPage(String(Math.max(1, (parseInt(inputPage, 10) || 1) - 10)))}
            >
              -10
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={() => setInputPage('1')}
            >
              First (1)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={() => setInputPage(String(totalPages))}
            >
              Last ({totalPages})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={() => setInputPage(String(Math.min(totalPages, (parseInt(inputPage, 10) || 1) + 10)))}
            >
              +10
            </Button>
          </View>

          {/* Jump Action */}
          <Button variant="primary" size="lg" onPress={handleJump}>
            পৃষ্ঠায় যান ➔
          </Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
