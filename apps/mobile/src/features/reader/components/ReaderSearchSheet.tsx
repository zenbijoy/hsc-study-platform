import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import { searchInsideBook } from '../utils/readerSearch';
import type { Chapter } from '@/src/types/book.types';

export function ReaderSearchSheet({
  visible,
  onClose,
  chapters,
  onJumpToPage,
}: {
  visible: boolean;
  onClose: () => void;
  chapters: Chapter[];
  onJumpToPage: (page: number) => void;
}) {
  const theme = useTheme();
  const [query, setQuery] = useState('');

  const results = searchInsideBook(query, chapters);

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
            maxHeight: '80%',
            padding: 20,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-white/10 mb-3">
            <AppText variant="titleLarge" color="primary" style={{ fontWeight: '800' }}>
              Search in Book
            </AppText>
            <Ionicons name="close" size={22} color={theme.colors.textMuted} onPress={onClose} />
          </View>

          {/* Search Field */}
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: theme.radius.xl,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
            className="flex-row items-center gap-2.5 mb-4"
          >
            <Ionicons name="search-outline" size={18} color={theme.colors.primary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search topics, formulas, or chapters..."
              placeholderTextColor={theme.colors.textMuted}
              autoFocus
              style={{
                color: theme.colors.textPrimary,
                fontSize: 14,
                padding: 0,
                margin: 0,
              }}
              className="flex-1"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Results List */}
          <ScrollView showsVerticalScrollIndicator={false} className="gap-2">
            {query.length >= 2 && results.length === 0 ? (
              <View className="py-8 items-center justify-center">
                <AppText variant="bodyMedium" color="muted">
                  No matching sections found for "{query}".
                </AppText>
              </View>
            ) : (
              results.map((res) => (
                <Card
                  key={res.id}
                  variant="interactive"
                  onPress={() => {
                    onJumpToPage(res.pageNumber);
                    onClose();
                  }}
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-2">
                      <View className="flex-row items-center gap-2 mb-1">
                        <AppText variant="caption" color="mint" style={{ fontWeight: '700' }}>
                          Page {res.pageNumber}
                        </AppText>
                        <AppText variant="caption" color="muted">•</AppText>
                        <AppText variant="caption" color="secondary" numberOfLines={1}>
                          {res.chapterTitle}
                        </AppText>
                      </View>
                      <AppText variant="bodySmall" color="primary">
                        {res.snippet}
                      </AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                  </View>
                </Card>
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
