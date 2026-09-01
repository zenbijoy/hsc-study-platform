import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import type { Chapter } from '@/src/types/book.types';

export function ReaderChapterDrawer({
  visible,
  onClose,
  chapters,
  currentPage,
  onSelectChapter,
}: {
  visible: boolean;
  onClose: () => void;
  chapters: Chapter[];
  currentPage: number;
  onSelectChapter: (chapter: Chapter) => void;
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
            maxHeight: '75%',
            padding: 20,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-white/10 mb-3">
            <AppText variant="titleLarge" color="primary" style={{ fontWeight: '800' }}>
              Chapter Navigation
            </AppText>
            <Ionicons name="close" size={22} color={theme.colors.textMuted} onPress={onClose} />
          </View>

          {/* Chapter List */}
          <ScrollView showsVerticalScrollIndicator={false} className="gap-2">
            {chapters.map((ch) => {
              const isCurrent =
                currentPage >= ch.startPage &&
                (ch.endPage ? currentPage <= ch.endPage : currentPage <= ch.startPage + 30);

              return (
                <Card
                  key={ch.id}
                  variant="interactive"
                  onPress={() => {
                    onSelectChapter(ch);
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
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        style={{
                          backgroundColor: isCurrent ? theme.colors.primary : 'rgba(255,255,255,0.08)',
                          borderRadius: theme.radius.md,
                          width: 32,
                          height: 32,
                        }}
                        className="items-center justify-center"
                      >
                        <AppText
                          variant="caption"
                          style={{
                            color: isCurrent ? '#071018' : theme.colors.textPrimary,
                            fontWeight: '800',
                          }}
                        >
                          {String(ch.chapterNumber).padStart(2, '0')}
                        </AppText>
                      </View>

                      <View className="flex-1">
                        <AppText
                          variant="titleMedium"
                          style={{
                            color: isCurrent ? theme.colors.primary : theme.colors.textPrimary,
                            fontWeight: isCurrent ? '700' : '500',
                          }}
                          numberOfLines={1}
                        >
                          {ch.title}
                        </AppText>
                        <AppText variant="caption" color="muted">
                          pp. {ch.startPage}–{ch.endPage || ch.startPage + 30}
                        </AppText>
                      </View>
                    </View>

                    <AppText
                      variant="caption"
                      style={{
                        color: isCurrent ? theme.colors.primary : theme.colors.textMuted,
                        fontWeight: '700',
                      }}
                    >
                      Jump ➔
                    </AppText>
                  </View>
                </Card>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
