import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { AppText } from '../ui/Typography';
import { Badge } from '../ui/Chip';

export interface BookCoverProps {
  title: string;
  subjectId?: string;
  coverUrl?: string;
  isProtected?: boolean;
  isOffline?: boolean;
  aspectRatio?: number;
  width?: number;
  className?: string;
}

export function BookCover({
  title,
  subjectId = 'physics',
  coverUrl,
  isProtected = true,
  isOffline = false,
  aspectRatio = 0.72,
  width = 110,
  className = '',
}: BookCoverProps) {
  const theme = useTheme();
  const subTheme = resolveSubjectTheme(subjectId);

  return (
    <View
      style={{
        width,
        aspectRatio,
        backgroundColor: subTheme.tintBg,
        borderColor: subTheme.primary,
        borderWidth: 1,
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
      }}
      className={`relative justify-between p-2.5 ${className}`}
    >
      {/* Top Badges */}
      <View className="flex-row items-center justify-between">
        <View
          style={{
            backgroundColor: 'rgba(7, 16, 24, 0.75)',
            borderRadius: theme.radius.sm,
            padding: 3,
          }}
        >
          <Ionicons name={subTheme.icon as any} size={14} color={subTheme.primary} />
        </View>

        {isProtected && (
          <View
            style={{
              backgroundColor: 'rgba(87, 224, 183, 0.2)',
              borderRadius: theme.radius.sm,
              paddingHorizontal: 4,
              paddingVertical: 1,
            }}
          >
            <AppText variant="caption" color="mint" style={{ fontSize: 9, fontWeight: '800' }}>
              HSCP
            </AppText>
          </View>
        )}
      </View>

      {/* Title & Subject */}
      <View>
        <AppText
          variant="labelMedium"
          numberOfLines={2}
          color="primary"
          style={{ fontSize: 11, lineHeight: 14 }}
        >
          {title}
        </AppText>
        <AppText variant="caption" color="muted" style={{ fontSize: 9 }} className="mt-0.5">
          {subTheme.nameBn}
        </AppText>
      </View>

      {/* Bottom Offline status indicator */}
      {isOffline && (
        <View className="absolute bottom-1.5 right-1.5">
          <Badge label="OFFLINE" variant="secondary" />
        </View>
      )}
    </View>
  );
}
