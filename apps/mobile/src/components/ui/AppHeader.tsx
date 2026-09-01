import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';
import { AppText } from './Typography';
import { IconButton } from './IconButton';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  transparent = false,
  className = '',
}: AppHeaderProps) {
  const router = useRouter();
  const theme = useTheme();

  const handleBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };

  return (
    <View
      style={{
        backgroundColor: transparent ? 'transparent' : theme.colors.background,
        borderBottomWidth: transparent ? 0 : 1,
        borderBottomColor: theme.colors.borderSubtle,
        paddingHorizontal: theme.spacing.screenHorizontal,
        paddingVertical: 12,
      }}
      className={`flex-row items-center justify-between ${className}`}
    >
      <View className="flex-row items-center flex-1 gap-3">
        {showBack && (
          <IconButton
            name="chevron-back"
            size="sm"
            variant="surface"
            onPress={handleBack}
            accessibilityLabel="Go back"
          />
        )}
        <View className="flex-1">
          <AppText variant="titleMedium" color="primary" numberOfLines={1}>
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="caption" color="muted" numberOfLines={1}>
              {subtitle}
            </AppText>
          )}
        </View>
      </View>

      {rightAction && <View className="flex-row items-center gap-2">{rightAction}</View>}
    </View>
  );
}
