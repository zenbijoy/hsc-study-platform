import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { AppText } from '@/src/components/ui/Typography';

export function SubjectQuickActions({
  subjectId,
  paperNumber,
}: {
  subjectId: string;
  paperNumber: number;
}) {
  const theme = useTheme();
  const router = useRouter();
  const subTheme = resolveSubjectTheme(subjectId);

  const actions: {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
  }[] = [
    {
      id: 'books',
      label: 'Textbooks',
      icon: 'library-outline',
      route: '/(tabs)/library',
    },
    {
      id: 'formulas',
      label: 'Formula Vault',
      icon: 'calculator-outline',
      route: '/(tabs)/formulas',
    },
    {
      id: 'practice',
      label: 'Board Exams',
      icon: 'school-outline',
      route: '/(tabs)/practice',
    },
  ];

  return (
    <View className="flex-row gap-2 mb-4">
      {actions.map((act) => (
        <Pressable
          key={act.id}
          onPress={() => router.push(act.route as any)}
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: theme.radius.lg,
            paddingVertical: 10,
            paddingHorizontal: 8,
          }}
          accessibilityRole="button"
          accessibilityLabel={act.label}
          className="flex-1 flex-row items-center justify-center gap-2 active:opacity-75"
        >
          <Ionicons name={act.icon} size={16} color={subTheme.primary} />
          <AppText variant="labelMedium" color="primary">
            {act.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
