import React from 'react';
import { ScrollView } from 'react-native';
import { Chip } from '@/src/components/ui/Chip';

const SUBJECT_FILTER_TABS = [
  { id: 'all', label: 'All Subjects' },
  { id: 'physics', label: 'Physics' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'mathematics', label: 'Higher Math' },
];

export function CQFilterBar({
  selectedSubject,
  onSelectSubject,
  officialOnly,
  onToggleOfficial,
  savedOnly,
  onToggleSaved,
}: {
  selectedSubject: string;
  onSelectSubject: (id: string) => void;
  officialOnly: boolean;
  onToggleOfficial: () => void;
  savedOnly: boolean;
  onToggleSaved: () => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-2 -mx-4 px-4"
      contentContainerStyle={{ gap: 8 }}
    >
      <Chip
        label="Saved ⭐"
        selected={savedOnly}
        onPress={onToggleSaved}
      />

      <Chip
        label="Official Board 🏛️"
        selected={officialOnly}
        onPress={onToggleOfficial}
      />

      {SUBJECT_FILTER_TABS.map((tab) => (
        <Chip
          key={tab.id}
          label={tab.label}
          selected={!savedOnly && selectedSubject === tab.id}
          onPress={() => {
            if (savedOnly) onToggleSaved();
            onSelectSubject(tab.id);
          }}
        />
      ))}
    </ScrollView>
  );
}
