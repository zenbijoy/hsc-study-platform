import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Badge } from '@/src/components/ui/Chip';
import { STUDENT_GROUPS } from '../constants/academicCatalog';
import { StudentGroup } from '../types/onboarding.types';

export function GroupStep({
  selectedGroup,
  onSelectGroup,
}: {
  selectedGroup?: StudentGroup;
  onSelectGroup: (group: StudentGroup) => void;
}) {
  const theme = useTheme();

  return (
    <View className="flex-1 justify-center py-4">
      <AppText variant="headlineLarge" color="primary" align="center" style={{ fontWeight: '800' }}>
        Select Your Academic Group
      </AppText>
      <AppText variant="bodySmall" color="muted" align="center" className="mt-1.5 mb-8">
        Full digital textbooks, formulas, and board question analysis are currently available for Science.
      </AppText>

      <View className="gap-3.5 max-w-sm w-full self-center">
        {STUDENT_GROUPS.map((group) => {
          const isSelected = selectedGroup === group.id;
          const isAvailable = group.isAvailable;

          return (
            <Pressable
              key={group.id}
              disabled={!isAvailable}
              onPress={() => onSelectGroup(group.id)}
              style={{
                backgroundColor: isSelected
                  ? 'rgba(87, 224, 183, 0.12)'
                  : isAvailable
                  ? theme.colors.surface
                  : 'rgba(255, 255, 255, 0.03)',
                borderColor: isSelected
                  ? theme.colors.primary
                  : isAvailable
                  ? theme.colors.border
                  : 'rgba(255, 255, 255, 0.05)',
                borderWidth: 1.5,
                borderRadius: theme.radius.xl,
                padding: 16,
                opacity: isAvailable ? 1 : 0.55,
              }}
              accessibilityRole="button"
              accessibilityLabel={group.nameEn}
              className="flex-row items-center justify-between active:opacity-75"
            >
              <View className="flex-row items-center gap-3.5 flex-1 pr-2">
                <View
                  style={{
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : 'rgba(255, 255, 255, 0.08)',
                    borderRadius: theme.radius.lg,
                    width: 44,
                    height: 44,
                  }}
                  className="items-center justify-center"
                >
                  <Ionicons
                    name={group.icon as any}
                    size={22}
                    color={isSelected ? '#071018' : theme.colors.primary}
                  />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <AppText
                      variant="titleMedium"
                      color={isSelected ? 'mint' : 'primary'}
                      style={{ fontWeight: '700' }}
                    >
                      {group.nameEn}
                    </AppText>
                    {!isAvailable && <Badge label="SOON" variant="secondary" />}
                  </View>
                  <AppText variant="caption" color="muted" numberOfLines={1} className="mt-0.5">
                    {group.nameBn} • {group.description}
                  </AppText>
                </View>
              </View>

              {isAvailable && (
                <View
                  style={{
                    backgroundColor: isSelected ? theme.colors.primary : 'rgba(255, 255, 255, 0.08)',
                    borderRadius: theme.radius.full,
                    width: 24,
                    height: 24,
                  }}
                  className="items-center justify-center"
                >
                  <Ionicons
                    name={isSelected ? 'checkmark' : 'ellipse-outline'}
                    size={14}
                    color={isSelected ? '#071018' : theme.colors.textMuted}
                  />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
