import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';

export function ReaderMoreSheet({
  visible,
  onClose,
  bookTitle,
  currentPage,
  totalPages,
  chapterTitle,
  versionId,
  isOffline,
  onOpenBookmarks,
  onOpenNotes,
  onOpenAppearance,
  onOpenPageJump,
}: {
  visible: boolean;
  onClose: () => void;
  bookTitle: string;
  currentPage: number;
  totalPages: number;
  chapterTitle?: string;
  versionId?: string;
  isOffline: boolean;
  onOpenBookmarks: () => void;
  onOpenNotes: () => void;
  onOpenAppearance: () => void;
  onOpenPageJump: () => void;
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
            <View>
              <AppText variant="titleLarge" color="primary" style={{ fontWeight: '800' }}>
                Reader Options
              </AppText>
              <AppText variant="caption" color="muted" numberOfLines={1}>
                {bookTitle}
              </AppText>
            </View>
            <Ionicons name="close" size={22} color={theme.colors.textMuted} onPress={onClose} />
          </View>

          {/* Book Info Summary Card */}
          <Card
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
              padding: 14,
              marginBottom: 16,
            }}
          >
            <View className="flex-row justify-between mb-1.5">
              <AppText variant="caption" color="muted">Current Section</AppText>
              <AppText variant="caption" color="primary" style={{ fontWeight: '700' }} numberOfLines={1}>
                {chapterTitle || 'Chapter 1'}
              </AppText>
            </View>
            <View className="flex-row justify-between mb-1.5">
              <AppText variant="caption" color="muted">Page Position</AppText>
              <AppText variant="caption" color="primary" style={{ fontWeight: '700' }}>
                Page {currentPage} of {totalPages} ({Math.round((currentPage / Math.max(1, totalPages)) * 100)}%)
              </AppText>
            </View>
            <View className="flex-row justify-between">
              <AppText variant="caption" color="muted">Package Status</AppText>
              <AppText variant="caption" color="mint" style={{ fontWeight: '700' }}>
                {isOffline ? 'Offline HSCP Encrypted' : 'Protected Stream'} {versionId ? `(${versionId})` : ''}
              </AppText>
            </View>
          </Card>

          {/* Quick Menu Actions */}
          <View className="gap-2">
            <Pressable
              onPress={() => {
                onClose();
                onOpenPageJump();
              }}
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.lg,
                padding: 14,
              }}
              className="flex-row items-center justify-between active:opacity-70"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="navigate-outline" size={20} color={theme.colors.primary} />
                <AppText variant="bodyMedium" color="primary" style={{ fontWeight: '600' }}>
                  নির্দিষ্ট পৃষ্ঠা নম্বরে যান (Go to Page)
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
            </Pressable>

            <Pressable
              onPress={() => {
                onClose();
                onOpenNotes();
              }}
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.lg,
                padding: 14,
              }}
              className="flex-row items-center justify-between active:opacity-70"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                <AppText variant="bodyMedium" color="primary" style={{ fontWeight: '600' }}>
                  ব্যক্তিগত নোটস (Page Notes)
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
            </Pressable>

            <Pressable
              onPress={() => {
                onClose();
                onOpenBookmarks();
              }}
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.lg,
                padding: 14,
              }}
              className="flex-row items-center justify-between active:opacity-70"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="bookmark-outline" size={20} color={theme.colors.primary} />
                <AppText variant="bodyMedium" color="primary" style={{ fontWeight: '600' }}>
                  বুকমার্ক তালিকা (Bookmarks)
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
            </Pressable>

            <Pressable
              onPress={() => {
                onClose();
                onOpenAppearance();
              }}
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.lg,
                padding: 14,
              }}
              className="flex-row items-center justify-between active:opacity-70"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="color-palette-outline" size={20} color={theme.colors.primary} />
                <AppText variant="bodyMedium" color="primary" style={{ fontWeight: '600' }}>
                  রিডার থিম ও স্ক্রল মোড (Appearance)
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
