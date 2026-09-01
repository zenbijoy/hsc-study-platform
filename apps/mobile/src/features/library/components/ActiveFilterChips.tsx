import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { LibraryFilters } from '../types/library.types';

export function ActiveFilterChips({
  filters,
  onClearSubject,
  onClearPaper,
  onClearDownloaded,
  onClearAll,
}: {
  filters: LibraryFilters;
  onClearSubject: (id: string) => void;
  onClearPaper: (num: number) => void;
  onClearDownloaded: () => void;
  onClearAll: () => void;
}) {
  const theme = useTheme();

  const hasFilters =
    filters.subjectIds.length > 0 ||
    filters.paperNumbers.length > 0 ||
    filters.downloadedOnly ||
    filters.publishers.length > 0;

  if (!hasFilters) return null;

  return (
    <View className="flex-row flex-wrap items-center gap-2 mb-3">
      {/* Subject Chips */}
      {filters.subjectIds.map((subId) => (
        <View
          key={`sub-${subId}`}
          style={{
            backgroundColor: 'rgba(87, 224, 183, 0.15)',
            borderColor: theme.colors.primary,
            borderWidth: 1,
            borderRadius: theme.radius.full,
            paddingLeft: 10,
            paddingRight: 6,
            paddingVertical: 4,
          }}
          className="flex-row items-center gap-1"
        >
          <AppText variant="caption" color="mint" style={{ textTransform: 'capitalize', fontWeight: '600' }}>
            {subId}
          </AppText>
          <Ionicons
            name="close-circle"
            size={14}
            color={theme.colors.primary}
            onPress={() => onClearSubject(subId)}
          />
        </View>
      ))}

      {/* Paper Chips */}
      {filters.paperNumbers.map((pNum) => (
        <View
          key={`paper-${pNum}`}
          style={{
            backgroundColor: 'rgba(108, 183, 255, 0.15)',
            borderColor: '#6CB7FF',
            borderWidth: 1,
            borderRadius: theme.radius.full,
            paddingLeft: 10,
            paddingRight: 6,
            paddingVertical: 4,
          }}
          className="flex-row items-center gap-1"
        >
          <AppText variant="caption" color="sky" style={{ fontWeight: '600' }}>
            Paper {pNum}
          </AppText>
          <Ionicons
            name="close-circle"
            size={14}
            color="#6CB7FF"
            onPress={() => onClearPaper(pNum)}
          />
        </View>
      ))}

      {/* Downloaded Chip */}
      {filters.downloadedOnly && (
        <View
          style={{
            backgroundColor: 'rgba(165, 139, 255, 0.15)',
            borderColor: '#A58BFF',
            borderWidth: 1,
            borderRadius: theme.radius.full,
            paddingLeft: 10,
            paddingRight: 6,
            paddingVertical: 4,
          }}
          className="flex-row items-center gap-1"
        >
          <AppText variant="caption" style={{ color: '#A58BFF', fontWeight: '600' }}>
            Downloaded Only
          </AppText>
          <Ionicons
            name="close-circle"
            size={14}
            color="#A58BFF"
            onPress={onClearDownloaded}
          />
        </View>
      )}

      {/* Clear All Button */}
      <Pressable onPress={onClearAll} className="active:opacity-75 pl-1">
        <AppText variant="caption" color="rose" style={{ fontWeight: '700' }}>
          Clear All
        </AppText>
      </Pressable>
    </View>
  );
}
