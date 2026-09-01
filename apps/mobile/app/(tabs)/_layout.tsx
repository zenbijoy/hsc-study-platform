import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTheme } from '@/src/theme';

const icons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  index: { active: 'home', inactive: 'home-outline' },
  library: { active: 'book', inactive: 'book-outline' },
  formulas: { active: 'calculator', inactive: 'calculator-outline' },
  practice: { active: 'school', inactive: 'school-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => {
        const iconConfig = icons[route.name] || { active: 'ellipse', inactive: 'ellipse-outline' };

        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            height: 68,
            paddingTop: 8,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginTop: 2,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? iconConfig.active : iconConfig.inactive}
              color={color}
              size={22}
            />
          ),
        };
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="formulas" options={{ title: 'Formulas' }} />
      <Tabs.Screen name="practice" options={{ title: 'Practice' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
