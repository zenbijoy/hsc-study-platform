import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { AppText } from '@/src/components/ui/Typography';
import { SCIENCE_SUBJECTS } from '../constants/academicCatalog';

export function SubjectsStep({
  selectedSubjectIds,
  onToggleSubject,
}: {
  selectedSubjectIds: string[];
  onToggleSubject: (subjectId: string) => void;
}) {
  const theme = useTheme();

  return (
    <View className="flex-1 py-4">
      <AppText variant="headlineLarge" color="primary" align="center" style={{ fontWeight: '800' }}>
        Choose Your Subjects
      </AppText>
      <AppText variant="bodySmall" color="muted" align="center" className="mt-1.5 mb-6">
        Select the subjects you want pinned to your daily study dashboard.
      </AppText>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="gap-2.5 max-w-sm w-full self-center">
          {SCIENCE_SUBJECTS.map((subject) => {
            const isSelected = selectedSubjectIds.includes(subject.id);
            const subTheme = resolveSubjectTheme(subject.id);

            return (
              <Pressable
                key={subject.id}
                onPress={() => onToggleSubject(subject.id)}
                style={{
                  backgroundColor: isSelected ? subTheme.tintBg : theme.colors.surface,
                  borderColor: isSelected ? subTheme.primary : theme.colors.border,
                  borderWidth: 1.5,
                  borderRadius: theme.radius.lg,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                className="flex-row items-center justify-between active:opacity-75"
              >
                <View className="flex-row items-center gap-3">
                  <View
                    style={{
                      backgroundColor: isSelected ? subTheme.primary : 'rgba(255, 255, 255, 0.08)',
                      borderRadius: theme.radius.md,
                      width: 36,
                      height: 36,
                    }}
                    className="items-center justify-center"
                  >
                    <Ionicons
                      name={subTheme.icon as any}
                      size={18}
                      color={isSelected ? '#071018' : subTheme.primary}
                    />
                  </View>

                  <View>
                    <AppText
                      variant="titleMedium"
                      color={isSelected ? 'mint' : 'primary'}
                      style={{ fontWeight: '700' }}
                    >
                      {subject.nameEn}
                    </AppText>
                    <AppText variant="caption" color="muted">
                      {subject.nameBn} {subject.isMandatory ? '• Core' : '• Elective'}
                    </AppText>
                  </View>
                </View>

                <Ionicons
                  name={isSelected ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isSelected ? subTheme.primary : theme.colors.textMuted}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
