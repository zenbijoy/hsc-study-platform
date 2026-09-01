import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { AppText } from '@/src/components/ui/Typography';
import { SubjectPaper } from '../types/subject.types';

export function PaperSelector({
  subjectId,
  papers,
  selectedPaperNumber,
  onSelectPaper,
}: {
  subjectId: string;
  papers: SubjectPaper[];
  selectedPaperNumber: number;
  onSelectPaper: (paperNumber: number) => void;
}) {
  const theme = useTheme();
  const subTheme = resolveSubjectTheme(subjectId);

  if (!papers || papers.length <= 1) return null;

  return (
    <View className="flex-row gap-2 mb-4">
      {papers.map((paper) => {
        const isSelected = selectedPaperNumber === paper.paperNumber;

        return (
          <Pressable
            key={paper.id}
            onPress={() => onSelectPaper(paper.paperNumber)}
            style={{
              backgroundColor: isSelected ? subTheme.tintBg : theme.colors.surface,
              borderColor: isSelected ? subTheme.primary : theme.colors.border,
              borderWidth: 1.5,
              borderRadius: theme.radius.lg,
              paddingVertical: 10,
              paddingHorizontal: 14,
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            className="flex-1 items-center active:opacity-75"
          >
            <AppText
              variant="labelMedium"
              style={{
                color: isSelected ? subTheme.primary : theme.colors.textPrimary,
                fontWeight: '700',
              }}
            >
              {paper.titleBn}
            </AppText>
            <AppText
              variant="caption"
              color="muted"
              numberOfLines={1}
              style={{ fontSize: 10, marginTop: 1 }}
            >
              {paper.titleEn}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
