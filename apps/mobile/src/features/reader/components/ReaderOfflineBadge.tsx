import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/src/components/ui/Typography';

export function ReaderOfflineBadge({ isOffline }: { isOffline: boolean }) {
  if (!isOffline) return null;

  return (
    <View
      style={{
        backgroundColor: 'rgba(87, 224, 183, 0.18)',
        borderColor: 'rgba(87, 224, 183, 0.3)',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}
      className="flex-row items-center gap-1.5"
    >
      <Ionicons name="cloud-offline" size={12} color="#57E0B7" />
      <AppText variant="caption" color="mint" style={{ fontWeight: '700', fontSize: 10 }}>
        Offline Ready
      </AppText>
    </View>
  );
}
