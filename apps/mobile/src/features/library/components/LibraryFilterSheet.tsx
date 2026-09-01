import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Chip } from '@/src/components/ui/Chip';
import { LibraryFilters } from '../types/library.types';

const SUBJECT_OPTIONS = [
  { id: 'physics', label: 'Physics' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'mathematics', label: 'Higher Mathematics' },
  { id: 'biology', label: 'Biology' },
  { id: 'ict', label: 'ICT' },
];

export function LibraryFilterSheet({
  visible,
  onClose,
  filters,
  onApplyFilters,
}: {
  visible: boolean;
  onClose: () => void;
  filters: LibraryFilters;
  onApplyFilters: (filters: LibraryFilters) => void;
}) {
  const theme = useTheme();
  const [draftFilters, setDraftFilters] = useState<LibraryFilters>(filters);

  // Sync draft when opened
  React.useEffect(() => {
    if (visible) setDraftFilters(filters);
  }, [visible, filters]);

  const toggleSubject = (id: string) => {
    setDraftFilters((prev) => {
      const exists = prev.subjectIds.includes(id);
      return {
        ...prev,
        subjectIds: exists
          ? prev.subjectIds.filter((s) => s !== id)
          : [...prev.subjectIds, id],
      };
    });
  };

  const togglePaper = (pNum: number) => {
    setDraftFilters((prev) => {
      const exists = prev.paperNumbers.includes(pNum);
      return {
        ...prev,
        paperNumbers: exists
          ? prev.paperNumbers.filter((p) => p !== pNum)
          : [...prev.paperNumbers, pNum],
      };
    });
  };

  const handleApply = () => {
    onApplyFilters(draftFilters);
    onClose();
  };

  const handleClearAll = () => {
    const cleared: LibraryFilters = {
      subjectIds: [],
      paperNumbers: [],
      publishers: [],
      downloadedOnly: false,
      inProgressOnly: false,
      updateAvailableOnly: false,
    };
    setDraftFilters(cleared);
    onApplyFilters(cleared);
    onClose();
  };

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
              Filter Textbooks
            </AppText>
            <Ionicons name="close" size={22} color={theme.colors.textMuted} onPress={onClose} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
            {/* Subject Section */}
            <AppText variant="labelMedium" color="primary" className="mb-2 font-bold">
              Subject
            </AppText>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {SUBJECT_OPTIONS.map((sub) => {
                const isSelected = draftFilters.subjectIds.includes(sub.id);
                return (
                  <Chip
                    key={sub.id}
                    label={sub.label}
                    selected={isSelected}
                    onPress={() => toggleSubject(sub.id)}
                  />
                );
              })}
            </View>

            {/* Paper Section */}
            <AppText variant="labelMedium" color="primary" className="mb-2 font-bold">
              Paper
            </AppText>
            <View className="flex-row gap-2 mb-4">
              <Chip
                label="1st Paper"
                selected={draftFilters.paperNumbers.includes(1)}
                onPress={() => togglePaper(1)}
              />
              <Chip
                label="2nd Paper"
                selected={draftFilters.paperNumbers.includes(2)}
                onPress={() => togglePaper(2)}
              />
            </View>

            {/* Availability Section */}
            <AppText variant="labelMedium" color="primary" className="mb-2 font-bold">
              Availability & Progress
            </AppText>
            <View className="flex-row flex-wrap gap-2 mb-4">
              <Chip
                label="Downloaded Only 💾"
                selected={draftFilters.downloadedOnly}
                onPress={() =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    downloadedOnly: !prev.downloadedOnly,
                  }))
                }
              />
              <Chip
                label="In Progress Reading 📖"
                selected={draftFilters.inProgressOnly}
                onPress={() =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    inProgressOnly: !prev.inProgressOnly,
                  }))
                }
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row items-center gap-3 pt-3 border-t border-white/10">
            <Pressable
              onPress={handleClearAll}
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: theme.radius.lg,
                paddingVertical: 14,
                flex: 1,
                alignItems: 'center',
              }}
              className="active:opacity-75"
            >
              <AppText variant="labelMedium" color="primary">
                Clear All
              </AppText>
            </Pressable>

            <Pressable
              onPress={handleApply}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.lg,
                paddingVertical: 14,
                flex: 1.5,
                alignItems: 'center',
              }}
              className="active:opacity-85"
            >
              <AppText
                variant="labelMedium"
                style={{ color: '#071018', fontWeight: '800' }}
              >
                Apply Filters
              </AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
