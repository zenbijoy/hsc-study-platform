import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { EDUCATION_BOARDS } from '../constants/academicCatalog';

export function BoardStep({
  selectedBoard,
  onSelectBoard,
}: {
  selectedBoard?: string;
  onSelectBoard: (boardId: string) => void;
}) {
  const theme = useTheme();

  return (
    <View className="flex-1 py-4">
      <AppText variant="headlineLarge" color="primary" align="center" style={{ fontWeight: '800' }}>
        Select Education Board
      </AppText>
      <AppText variant="bodySmall" color="muted" align="center" className="mt-1.5 mb-6">
        We prioritize past board questions (সৃজনশীল ও বহুনির্বাচনী) from your specific division.
      </AppText>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="flex-row flex-wrap gap-2.5 justify-center">
          {EDUCATION_BOARDS.map((board) => {
            const isSelected = selectedBoard === board.id;

            return (
              <Pressable
                key={board.id}
                onPress={() => onSelectBoard(board.id)}
                style={{
                  backgroundColor: isSelected ? 'rgba(87, 224, 183, 0.12)' : theme.colors.surface,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  borderWidth: 1.5,
                  borderRadius: theme.radius.lg,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  minWidth: '45%',
                }}
                accessibilityRole="button"
                accessibilityLabel={`${board.nameEn} Board`}
                className="flex-row items-center justify-between active:opacity-75"
              >
                <View>
                  <AppText
                    variant="labelMedium"
                    color={isSelected ? 'mint' : 'primary'}
                    style={{ fontWeight: '700' }}
                  >
                    {board.nameEn}
                  </AppText>
                  <AppText variant="caption" color="muted" style={{ fontSize: 10 }}>
                    {board.nameBn}
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
      </ScrollView>
    </View>
  );
}
