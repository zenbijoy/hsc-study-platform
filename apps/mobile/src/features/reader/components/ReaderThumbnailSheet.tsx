import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import type { ReaderBookmark } from '../types/reader.types';

export function ReaderThumbnailSheet({
  visible,
  onClose,
  totalPages,
  currentPage,
  bookmarks,
  onSelectPage,
}: {
  visible: boolean;
  onClose: () => void;
  totalPages: number;
  currentPage: number;
  bookmarks: ReaderBookmark[];
  onSelectPage: (page: number) => void;
}) {
  const theme = useTheme();

  // Create page grid array
  const pages = Array.from({ length: Math.min(600, totalPages) }, (_, i) => i + 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} className="flex-1 justify-end">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.colors.surfaceElevated,
            borderTopLeftRadius: theme.radius.xxl,
            borderTopRightRadius: theme.radius.xxl,
            maxHeight: '80%',
            padding: 20,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-white/10 mb-4">
            <View>
              <AppText variant="titleLarge" color="primary" style={{ fontWeight: '800' }}>
                Page Thumbnails
              </AppText>
              <AppText variant="caption" color="muted">
                Jump to any page across {totalPages} pages
              </AppText>
            </View>
            <Ionicons name="close" size={22} color={theme.colors.textMuted} onPress={onClose} />
          </View>

          {/* Virtualized Page Grid */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap gap-3 justify-between pb-6">
              {pages.map((p) => {
                const isCurrent = p === currentPage;
                const hasBookmark = bookmarks.some((b) => b.pageNumber === p);

                return (
                  <Pressable
                    key={`page-${p}`}
                    onPress={() => {
                      onSelectPage(p);
                      onClose();
                    }}
                    style={{
                      width: '30%',
                      aspectRatio: 0.75,
                      backgroundColor: isCurrent ? 'rgba(87, 224, 183, 0.15)' : theme.colors.surface,
                      borderColor: isCurrent ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)',
                      borderWidth: isCurrent ? 2 : 1,
                      borderRadius: theme.radius.md,
                      padding: 6,
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    className="active:opacity-70"
                  >
                    {/* Top Bookmark indicator */}
                    <View className="w-full flex-row justify-end">
                      {hasBookmark && (
                        <Ionicons name="bookmark" size={12} color={theme.colors.primary} />
                      )}
                    </View>

                    {/* Page Content Skeleton Lines */}
                    <View className="w-full items-center gap-1 opacity-20">
                      <View style={{ width: '80%', height: 3, backgroundColor: theme.colors.textPrimary, borderRadius: 2 }} />
                      <View style={{ width: '90%', height: 3, backgroundColor: theme.colors.textPrimary, borderRadius: 2 }} />
                      <View style={{ width: '70%', height: 3, backgroundColor: theme.colors.textPrimary, borderRadius: 2 }} />
                    </View>

                    {/* Page Number Label */}
                    <AppText
                      variant="caption"
                      style={{
                        color: isCurrent ? theme.colors.primary : theme.colors.textMuted,
                        fontWeight: isCurrent ? '800' : '600',
                        fontSize: 11,
                      }}
                    >
                      {p}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
