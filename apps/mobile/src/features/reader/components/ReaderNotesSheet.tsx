import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import type { ReaderNote } from '../types/reader.types';

export function ReaderNotesSheet({
  visible,
  onClose,
  notes,
  currentPage,
  chapterTitle,
  onSaveNote,
  onDeleteNote,
  onJumpToNote,
}: {
  visible: boolean;
  onClose: () => void;
  notes: ReaderNote[];
  currentPage: number;
  chapterTitle?: string;
  onSaveNote: (pageNumber: number, text: string, noteId?: string) => void;
  onDeleteNote: (id: string) => void;
  onJumpToNote: (pageNumber: number) => void;
}) {
  const theme = useTheme();
  const [inputText, setInputText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const handleSave = () => {
    if (!inputText.trim()) return;
    onSaveNote(currentPage, inputText.trim(), editingNoteId || undefined);
    setInputText('');
    setEditingNoteId(null);
  };

  const handleStartEdit = (note: ReaderNote) => {
    setEditingNoteId(note.id);
    setInputText(note.text);
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
            maxHeight: '85%',
            padding: 20,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-white/10 mb-4">
            <View>
              <AppText variant="titleLarge" color="primary" style={{ fontWeight: '800' }}>
                ব্যক্তিগত নোট (Page Notes)
              </AppText>
              <AppText variant="caption" color="muted">
                পৃষ্ঠা {currentPage} • {chapterTitle || 'General'}
              </AppText>
            </View>
            <Ionicons name="close" size={22} color={theme.colors.textMuted} onPress={onClose} />
          </View>

          {/* Add / Edit Input Box */}
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: theme.radius.lg,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={`পৃষ্ঠা ${currentPage}-এর জন্য গুরুত্বপূর্ণ নোট লিখুন...`}
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={3}
              style={{
                color: theme.colors.textPrimary,
                fontSize: 14,
                textAlignVertical: 'top',
                minHeight: 60,
              }}
            />
            <View className="flex-row justify-end gap-2 mt-2">
              {editingNoteId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    setEditingNoteId(null);
                    setInputText('');
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onPress={handleSave}
                disabled={!inputText.trim()}
              >
                {editingNoteId ? 'Update Note' : 'Add Note to Page'}
              </Button>
            </View>
          </View>

          {/* Notes List */}
          <AppText variant="labelMedium" color="primary" className="mb-2 font-bold">
            সব সংরক্ষিত নোট ({notes.length})
          </AppText>
          <ScrollView showsVerticalScrollIndicator={false} className="gap-2">
            {notes.length === 0 ? (
              <View className="py-8 items-center justify-center">
                <AppText variant="bodyMedium" color="muted">
                  এই বইতে কোনো নোট যুক্ত করা হয়নি।
                </AppText>
              </View>
            ) : (
              notes.map((n) => (
                <Card
                  key={n.id}
                  variant="interactive"
                  onPress={() => {
                    onJumpToNote(n.pageNumber);
                    onClose();
                  }}
                  style={{
                    backgroundColor: n.pageNumber === currentPage ? 'rgba(87, 224, 183, 0.08)' : theme.colors.surface,
                    borderColor: n.pageNumber === currentPage ? theme.colors.primary : theme.colors.border,
                    borderWidth: 1,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <AppText variant="caption" color="mint" style={{ fontWeight: '700' }}>
                      পৃষ্ঠা {n.pageNumber}
                    </AppText>
                    <View className="flex-row items-center gap-2">
                      <Pressable onPress={() => handleStartEdit(n)} className="p-1">
                        <Ionicons name="create-outline" size={16} color={theme.colors.textMuted} />
                      </Pressable>
                      <Pressable onPress={() => onDeleteNote(n.id)} className="p-1">
                        <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                      </Pressable>
                    </View>
                  </View>
                  <AppText variant="bodySmall" color="primary">
                    {n.text}
                  </AppText>
                </Card>
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
