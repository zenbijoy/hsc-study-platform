import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import { QuickActionItem } from '../types/home.types';

export function QuickActionsSection({
  actions,
  title = 'Quick Tools',
}: {
  actions: QuickActionItem[];
  title?: string;
}) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View className="mb-4">
      <AppText variant="titleMedium" color="primary" className="mb-2.5 font-bold">
        {title}
      </AppText>

      <View className="flex-row flex-wrap gap-2.5">
        {actions.map((action) => (
          <Pressable
            key={action.id}
            onPress={() => router.push(action.route as any)}
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: theme.radius.lg,
              padding: 12,
              flexBasis: '48%',
              flexGrow: 1,
            }}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            className="flex-row items-center gap-3 active:opacity-75"
          >
            <View
              style={{
                backgroundColor: `${action.accentColor}18`,
                borderRadius: theme.radius.md,
                width: 38,
                height: 38,
              }}
              className="items-center justify-center"
            >
              <Ionicons name={action.icon} size={20} color={action.accentColor} />
            </View>

            <View className="flex-1">
              <AppText variant="labelMedium" color="primary" numberOfLines={1}>
                {action.label}
              </AppText>
              {action.badge ? (
                <AppText variant="caption" color="muted" numberOfLines={1} style={{ fontSize: 10 }}>
                  {action.badge}
                </AppText>
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
