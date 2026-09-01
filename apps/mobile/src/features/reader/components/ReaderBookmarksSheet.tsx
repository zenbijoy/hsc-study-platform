import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import type { ReaderBookmark } from '../types/reader.types';

export function ReaderBookmarksSheet({
  visible,
  onClose,
  bookmarks,
  currentPage,
  onSelectBookmark,
  onRemoveBookmark,
}: {
  visible: boolean;
  onClose: () => void;
  bookmarks: ReaderBookmark[];
  currentPage: number;
  onSelectBookmark: (bookmark: ReaderBookmark) => void;
  onRemoveBookmark: (id: string) => void;
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
            maxHeight: '75%',
            padding: 20,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-white/10 mb-4">
            <View>
              <AppText variant="titleLarge" color="primary" style={{ fontWeight: '800' }}>
                বুকমার্ক তালিকা (Bookmarks)
              </AppText>
              <AppText variant="caption" color="muted">
                {bookmarks.length}টি বুকমার্ক সংরক্ষিত
              </AppText>
            </View>
            <Ionicons name="close" size={22} color={theme.colors.textMuted} onPress={onClose} />
          </View>

          {/* Bookmarks List */}
          <ScrollView showsVerticalScrollIndicator={false} className="gap-2">
            {bookmarks.length === 0 ? (
              <View className="py-12 items-center justify-center">
                <Ionicons name="bookmark-outline" size={32} color={theme.colors.textMuted} />
                <AppText variant="bodyMedium" color="muted" className="mt-3 text-center">
                  কোনো বুকমার্ক যোগ করা হয়নি।{'\n'}পড়ার সময় নিচের বুকমার্ক আইকন চাপুন।
                </AppText>
              </View>
            ) : (
              bookmarks.map((bm) => {
                const isCurrent = bm.pageNumber === currentPage;

                return (
                  <Card
                    key={bm.id}
                    variant="interactive"
                    onPress={() => {
                      onSelectBookmark(bm);
                      onClose();
                    }}
                    style={{
                      backgroundColor: isCurrent ? 'rgba(87, 224, 183, 0.12)' : theme.colors.surface,
                      borderColor: isCurrent ? theme.colors.primary : theme.colors.border,
                      borderWidth: 1,
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <View className="flex-row items-center gap-2 mb-1">
                          <AppText variant="caption" color="mint" style={{ fontWeight: '700' }}>
                            পৃষ্ঠা {bm.pageNumber}
                          </AppText>
                          {bm.chapterTitle && (
                            <>
                              <AppText variant="caption" color="muted">•</AppText>
                              <AppText variant="caption" color="secondary" numberOfLines={1}>
                                {bm.chapterTitle}
                              </AppText>
                            </>
                          )}
                        </View>
                        <AppText variant="bodySmall" color="primary" numberOfLines={1}>
                          {bm.title || `Bookmark • Page ${bm.pageNumber}`}
                        </AppText>
                      </View>

                      {/* Delete Action */}
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          onRemoveBookmark(bm.id);
                        }}
                        className="p-2 active:opacity-60"
                      >
                        <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                      </Pressable>
                    </View>
                  </Card>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
