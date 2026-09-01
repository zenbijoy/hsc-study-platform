import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { DAILY_GOALS, STUDY_FOCUS_OPTIONS } from '../constants/academicCatalog';
import { StudyFocus } from '../types/onboarding.types';

export function PreferencesStep({
  selectedFocus,
  onToggleFocus,
  selectedDailyGoal,
  onSelectDailyGoal,
}: {
  selectedFocus: StudyFocus[];
  onToggleFocus: (focus: StudyFocus) => void;
  selectedDailyGoal: number;
  onSelectDailyGoal: (minutes: number) => void;
}) {
  const theme = useTheme();

  return (
    <View className="flex-1 py-4">
      <AppText variant="headlineLarge" color="primary" align="center" style={{ fontWeight: '800' }}>
        Study Preferences
      </AppText>
      <AppText variant="bodySmall" color="muted" align="center" className="mt-1.5 mb-6">
        Customize your daily learning goals (optional).
      </AppText>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="max-w-sm w-full self-center">
          {/* 1. Primary Focus */}
          <AppText variant="labelMedium" color="secondary" className="mb-2 font-bold">
            What are you focusing on right now?
          </AppText>

          <View className="gap-2 mb-6">
            {STUDY_FOCUS_OPTIONS.map((item) => {
              const isSelected = selectedFocus.includes(item.id);

              return (
                <Pressable
                  key={item.id}
                  onPress={() => onToggleFocus(item.id)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(87, 224, 183, 0.12)' : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    borderWidth: 1.5,
                    borderRadius: theme.radius.lg,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                  }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  className="flex-row items-center justify-between active:opacity-75"
                >
                  <View className="flex-row items-center gap-2.5">
                    <Ionicons
                      name={item.icon as any}
                      size={18}
                      color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <AppText
                      variant="bodySmall"
                      color={isSelected ? 'mint' : 'primary'}
                      style={{ fontWeight: isSelected ? '700' : '400' }}
                    >
                      {item.labelEn}
                    </AppText>
                  </View>

                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                  />
                </Pressable>
              );
            })}
          </View>

          {/* 2. Daily Goal */}
          <AppText variant="labelMedium" color="secondary" className="mb-2 font-bold">
            Daily Study Goal Target
          </AppText>
          <View className="flex-row gap-2">
            {DAILY_GOALS.map((goal) => {
              const isSelected = selectedDailyGoal === goal.minutes;

              return (
                <Pressable
                  key={goal.minutes}
                  onPress={() => onSelectDailyGoal(goal.minutes)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(87, 224, 183, 0.15)' : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    borderWidth: 1.5,
                    borderRadius: theme.radius.lg,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                  }}
                  accessibilityRole="button"
                  className="flex-1 items-center active:opacity-75"
                >
                  <AppText
                    variant="labelMedium"
                    color={isSelected ? 'mint' : 'primary'}
                    style={{ fontWeight: '700' }}
                  >
                    {goal.minutes} min
                  </AppText>
                  <AppText variant="caption" color="muted" style={{ fontSize: 10 }}>
                    {goal.sub}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
