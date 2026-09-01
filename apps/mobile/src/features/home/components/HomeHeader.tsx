import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { IconButton } from '@/src/components/ui/IconButton';

export function HomeHeader({
  greetingText,
  studentName,
  academicContext,
}: {
  greetingText: string;
  studentName: string;
  academicContext: string;
}) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View className="flex-row items-start justify-between py-4 mb-2">
      <View className="flex-1 pr-3">
        {/* Academic Batch Badge */}
        <View
          style={{
            backgroundColor: 'rgba(87, 224, 183, 0.12)',
            borderRadius: theme.radius.sm,
            paddingHorizontal: 8,
            paddingVertical: 2,
            alignSelf: 'flex-start',
          }}
          className="mb-1.5"
        >
          <AppText
            variant="caption"
            color="mint"
            style={{ fontWeight: '800', fontSize: 10, letterSpacing: 0.5 }}
          >
            {academicContext.toUpperCase()}
          </AppText>
        </View>

        {/* Greeting Title */}
        <AppText variant="headlineLarge" color="primary" numberOfLines={1} style={{ fontWeight: '800' }}>
          {greetingText}, {studentName} 👋
        </AppText>
        <AppText variant="bodySmall" color="muted" className="mt-0.5">
          Ready for your next study session?
        </AppText>
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center gap-2 pt-1">
        <IconButton
          name="search-outline"
          variant="surface"
          onPress={() => router.push('/(tabs)/library' as any)}
          accessibilityLabel="Search library"
        />
        <IconButton
          name="notifications-outline"
          variant="surface"
          onPress={() => {}}
          accessibilityLabel="Notifications"
        />
      </View>
    </View>
  );
}
