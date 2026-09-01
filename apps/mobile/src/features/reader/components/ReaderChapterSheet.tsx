import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import type { Chapter } from '@/src/types/book.types';
import { calculateChapterProgress, classifySectionType } from '../utils/chapterLookup';

export function ReaderChapterSheet({
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
  const [filter, setFilter] = useState('');

  const filteredChapters = chapters.filter((ch) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      ch.title.toLowerCase().includes(q) ||
      (ch.banglaTitle && ch.banglaTitle.toLowerCase().includes(q)) ||
      String(ch.chapterNumber).includes(q)
    );
  });

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
          <View className="flex-row items-center justify-between pb-3 border-b border-white/10 mb-3">
            <View>
              <AppText variant="titleLarge" color="primary" style={{ fontWeight: '800' }}>
                সূচিপত্র ও অধ্যায় তালিকা
              </AppText>
              <AppText variant="caption" color="muted">
                {chapters.length}টি অধ্যায় • বর্তমান পৃষ্ঠা {currentPage}
              </AppText>
            </View>
            <Ionicons name="close" size={22} color={theme.colors.textMuted} onPress={onClose} />
          </View>

          {/* Quick Filter */}
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: theme.radius.lg,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
            className="flex-row items-center gap-2 mb-3"
          >
            <Ionicons name="search-outline" size={16} color={theme.colors.textMuted} />
            <TextInput
              value={filter}
              onChangeText={setFilter}
              placeholder="অধ্যায়ের নাম বা নম্বর খুঁজুন..."
              placeholderTextColor={theme.colors.textMuted}
              style={{ color: theme.colors.textPrimary, fontSize: 13, flex: 1, padding: 0 }}
            />
          </View>

          {/* Chapter List */}
          <ScrollView showsVerticalScrollIndicator={false} className="gap-2">
            {filteredChapters.map((ch, idx) => {
              const nextCh = chapters[idx + 1];
              const isCurrent =
                currentPage >= ch.startPage &&
                (ch.endPage ? currentPage <= ch.endPage : nextCh ? currentPage < nextCh.startPage : true);

              const progressPct = calculateChapterProgress(ch, currentPage, nextCh);
              const sectionType = classifySectionType(ch.title);

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
                      {/* Section Badge */}
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
                          {sectionType === 'chapter' ? String(ch.chapterNumber).padStart(2, '0') : '§'}
                        </AppText>
                      </View>

                      {/* Title & Page Range */}
                      <View className="flex-1">
                        <AppText
                          variant="titleMedium"
                          style={{
                            color: isCurrent ? theme.colors.primary : theme.colors.textPrimary,
                            fontWeight: isCurrent ? '700' : '500',
                          }}
                          numberOfLines={1}
                        >
                          {ch.banglaTitle || ch.title}
                        </AppText>
                        <AppText variant="caption" color="muted">
                          পৃষ্ঠা {ch.startPage}–{ch.endPage || (nextCh ? nextCh.startPage - 1 : ch.startPage + 30)}
                        </AppText>
                      </View>
                    </View>

                    {/* Progress Badge */}
                    <View className="items-end">
                      <AppText
                        variant="caption"
                        style={{
                          color: isCurrent ? theme.colors.primary : theme.colors.textMuted,
                          fontWeight: '700',
                        }}
                      >
                        {progressPct > 0 ? `${progressPct}%` : 'Jump ➔'}
                      </AppText>
                    </View>
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
