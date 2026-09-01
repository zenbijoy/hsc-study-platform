import React from 'react';
import { View } from 'react-native';
import { SearchField } from '@/src/components/ui/SearchField';

export function LibrarySearchBar({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View className="mb-3">
      <SearchField
        value={value}
        onChangeText={onChangeText}
        placeholder="Search books, subjects, publishers..."
      />
    </View>
  );
}
