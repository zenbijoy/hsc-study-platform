import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/src/components/ui/Typography';

export function ReaderSyncIndicator({ isSyncing }: { isSyncing: boolean }) {
  if (!isSyncing) return null;

  return (
    <View
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
      }}
      className="flex-row items-center gap-1"
    >
      <Ionicons name="sync-outline" size={12} color="#6CB7FF" />
      <AppText variant="caption" style={{ color: '#6CB7FF', fontSize: 9, fontWeight: '700' }}>
        Syncing
      </AppText>
    </View>
  );
}
