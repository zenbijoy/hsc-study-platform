import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { ACADEMIC_YEARS } from '../constants/academicCatalog';

export function YearStep({
  selectedYear,
  onSelectYear,
}: {
  selectedYear?: number;
  onSelectYear: (year: number) => void;
}) {
  const theme = useTheme();

  return (
    <View className="flex-1 justify-center py-4">
      <AppText variant="headlineLarge" color="primary" align="center" style={{ fontWeight: '800' }}>
        Select Your HSC Batch
      </AppText>
      <AppText variant="bodySmall" color="muted" align="center" className="mt-1.5 mb-8">
        We will customize syllabus chapters and practice exams for your target year.
      </AppText>

      <View className="gap-3 max-w-sm w-full self-center">
        {ACADEMIC_YEARS.map((option) => {
          const isSelected = selectedYear === option.year;

          return (
            <Pressable
              key={option.year}
              onPress={() => onSelectYear(option.year)}
              style={{
                backgroundColor: isSelected ? 'rgba(87, 224, 183, 0.12)' : theme.colors.surface,
                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                borderWidth: 1.5,
                borderRadius: theme.radius.xl,
                paddingVertical: 18,
                paddingHorizontal: 20,
              }}
              accessibilityRole="button"
              accessibilityLabel={option.labelEn}
              className="flex-row items-center justify-between active:opacity-75"
            >
              <View>
                <AppText
                  variant="titleLarge"
                  color={isSelected ? 'mint' : 'primary'}
                  style={{ fontWeight: '700' }}
                >
                  {option.labelEn}
                </AppText>
                <AppText variant="caption" color="muted" className="mt-0.5">
                  {option.labelBn} {option.isCurrent ? '• Regular Batch' : ''}
                </AppText>
              </View>

              <View
                style={{
                  backgroundColor: isSelected ? theme.colors.primary : 'rgba(255, 255, 255, 0.08)',
                  borderRadius: theme.radius.full,
                  width: 28,
                  height: 28,
                }}
                className="items-center justify-center"
              >
                <Ionicons
                  name={isSelected ? 'checkmark' : 'ellipse-outline'}
                  size={16}
                  color={isSelected ? '#071018' : theme.colors.textMuted}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
