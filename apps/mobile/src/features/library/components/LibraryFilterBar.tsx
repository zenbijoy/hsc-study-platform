import React from 'react';
import { ScrollView, View } from 'react-native';
import { Chip } from '@/src/components/ui/Chip';

const QUICK_FILTER_OPTIONS = [
  { id: 'all', label: 'All Books', subjectId: '' },
  { id: 'physics', label: 'Physics', subjectId: 'physics' },
  { id: 'chemistry', label: 'Chemistry', subjectId: 'chemistry' },
  { id: 'mathematics', label: 'Higher Math', subjectId: 'mathematics' },
  { id: 'biology', label: 'Biology', subjectId: 'biology' },
  { id: 'ict', label: 'ICT', subjectId: 'ict' },
];

export function LibraryFilterBar({
  selectedSubjectIds,
  onSelectSubject,
  downloadedOnly,
  onToggleDownloaded,
}: {
  selectedSubjectIds: string[];
  onSelectSubject: (subjectId: string) => void;
  downloadedOnly: boolean;
  onToggleDownloaded: () => void;
}) {
  const isAllSelected = selectedSubjectIds.length === 0 && !downloadedOnly;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-3 -mx-4 px-4"
      contentContainerStyle={{ gap: 8 }}
    >
      {/* All Books Chip */}
      <Chip
        label="All Books"
        selected={isAllSelected}
        onPress={() => onSelectSubject('')}
      />

      {/* Downloaded Chip */}
      <Chip
        label="Downloaded 💾"
        selected={downloadedOnly}
        onPress={onToggleDownloaded}
      />

      {/* Subject Chips */}
      {QUICK_FILTER_OPTIONS.slice(1).map((opt) => {
        const isSelected = selectedSubjectIds.includes(opt.subjectId);
        return (
          <Chip
            key={opt.id}
            label={opt.label}
            selected={isSelected}
            onPress={() => onSelectSubject(opt.subjectId)}
          />
        );
      })}
    </ScrollView>
  );
}
