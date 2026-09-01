import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';

export interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search textbooks, formulas, questions...',
  onFilterPress,
  hasActiveFilters = false,
  className = '',
}: SearchFieldProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: isFocused ? theme.colors.primary : theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.xl,
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}
      className={`flex-row items-center gap-2.5 ${className}`}
    >
      <Ionicons
        name="search-outline"
        size={18}
        color={isFocused ? theme.colors.primary : theme.colors.textMuted}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          color: theme.colors.textPrimary,
          fontSize: 14,
          padding: 0,
          margin: 0,
        }}
        className="flex-1"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} className="active:opacity-75">
          <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
        </Pressable>
      )}
      {onFilterPress && (
        <Pressable
          onPress={onFilterPress}
          hitSlop={8}
          style={{
            backgroundColor: hasActiveFilters ? 'rgba(87, 224, 183, 0.15)' : 'transparent',
            borderRadius: theme.radius.sm,
            padding: 4,
          }}
          className="active:opacity-75"
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={hasActiveFilters ? theme.colors.primary : theme.colors.textMuted}
          />
        </Pressable>
      )}
    </View>
  );
}
