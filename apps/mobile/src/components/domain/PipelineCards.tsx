import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { Card } from '../ui/Card';
import { AppText } from '../ui/Typography';
import { LinearProgress } from '../ui/Progress';
import { Badge } from '../ui/Chip';

export function UploadProgressCard({
  filename,
  sizeMb,
  stage,
  progress,
  error,
}: {
  filename: string;
  sizeMb: number;
  stage: string;
  progress: number;
  error?: string;
}) {
  const theme = useTheme();

  return (
    <Card variant="outlined" className="p-4 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1 gap-2.5 mr-2">
          <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
          <View className="flex-1">
            <AppText variant="titleMedium" color="primary" numberOfLines={1}>
              {filename}
            </AppText>
            <AppText variant="caption" color="muted">
              {sizeMb.toFixed(1)} MB • {stage}
            </AppText>
          </View>
        </View>
        <AppText variant="labelMedium" color="mint">
          {Math.round(progress)}%
        </AppText>
      </View>

      <LinearProgress percentage={progress} height={6} />

      {error && (
        <AppText variant="caption" color="rose" className="mt-2">
          {error}
        </AppText>
      )}
    </Card>
  );
}

export function ProcessingTimeline({
  stages,
  activeStageIndex,
}: {
  stages: string[];
  activeStageIndex: number;
}) {
  const theme = useTheme();

  return (
    <View className="gap-3 py-2">
      {stages.map((stage, index) => {
        const isComplete = index < activeStageIndex;
        const isActive = index === activeStageIndex;

        let iconColor = theme.colors.textMuted;
        let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline';

        if (isComplete) {
          iconColor = theme.colors.success;
          iconName = 'checkmark-circle';
        } else if (isActive) {
          iconColor = theme.colors.primary;
          iconName = 'radio-button-on';
        }

        return (
          <View key={stage} className="flex-row items-center gap-3">
            <Ionicons name={iconName} size={18} color={iconColor} />
            <AppText
              variant="bodySmall"
              color={isActive ? 'mint' : isComplete ? 'primary' : 'muted'}
              style={{ fontWeight: isActive ? '700' : '400' }}
            >
              {stage}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  if (confidence >= 0.85) {
    return <Badge label="HIGH CONFIDENCE" variant="primary" />;
  }
  if (confidence >= 0.6) {
    return <Badge label="MEDIUM CONFIDENCE" variant="warning" />;
  }
  return <Badge label="REVIEW NEEDED" variant="danger" />;
}

export function SecureBadge({
  type,
}: {
  type: 'protected' | 'offline' | 'downloaded' | 'update';
}) {
  switch (type) {
    case 'protected':
      return <Badge label="HSCP PROTECTED" variant="primary" />;
    case 'offline':
      return <Badge label="OFFLINE AVAILABLE" variant="secondary" />;
    case 'downloaded':
      return <Badge label="DOWNLOADED" variant="secondary" />;
    case 'update':
      return <Badge label="UPDATE AVAILABLE" variant="warning" />;
  }
}
