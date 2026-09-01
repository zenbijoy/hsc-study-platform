import React from 'react';
import { ScrollView, View } from 'react-native';
import { Chip } from './Chip';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  accentColor?: string;
}

export function FilterChipGroup({
  options,
  selectedId,
  onSelect,
  className = '',
}: {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={`py-1 ${className}`}
      contentContainerStyle={{ paddingHorizontal: 2 }}
    >
      <View className="flex-row items-center gap-2">
        {options.map((option) => (
          <Chip
            key={option.id}
            label={option.count !== undefined ? `${option.label} (${option.count})` : option.label}
            selected={selectedId === option.id}
            accentColor={option.accentColor}
            variant={option.accentColor ? 'subject' : 'neutral'}
            onPress={() => onSelect(option.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
