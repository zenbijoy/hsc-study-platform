import React from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme';
import { AppText } from './Typography';

export function Section({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <View style={[{ marginBottom: theme.spacing.sectionGap }, style]} className={className}>
      {children}
    </View>
  );
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  className = '',
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  const theme = useTheme();

  return (
    <View className={`flex-row items-center justify-between mb-3 px-1 ${className}`}>
      <View className="flex-1 pr-2">
        <AppText variant="titleMedium" color="primary">
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="caption" color="muted" className="mt-0.5">
            {subtitle}
          </AppText>
        )}
      </View>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8} className="active:opacity-75">
          <AppText variant="labelMedium" color="mint">
            {actionLabel}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

export function Divider({
  vertical = false,
  className = '',
}: {
  vertical?: boolean;
  className?: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.border,
        ...(vertical ? { width: 1, height: '100%' } : { height: 1, width: '100%' }),
      }}
      className={className}
    />
  );
}

export function Spacer({ size = 16 }: { size?: number }) {
  return <View style={{ height: size, width: size }} />;
}
