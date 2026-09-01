import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import { AppText } from '@/src/components/ui/Typography';
import { BookDetailsViewModel } from '../types/bookDetails.types';

export function BookPrimaryActions({
  viewModel,
  onOpenDownloadSheet,
}: {
  viewModel: BookDetailsViewModel;
  onOpenDownloadSheet: () => void;
}) {
  const theme = useTheme();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const subTheme = resolveSubjectTheme(viewModel.book.subjectId);

  const hasProgress = viewModel.progress.progressPercentage > 0;
  const isDownloaded = viewModel.download.isReady;

  const handleRead = () => {
    router.push(`/reader/${viewModel.book.id}` as any);
  };

  return (
    <View className="flex-row items-center gap-3 mb-4">
      {/* Primary Read CTA */}
      <Pressable
        onPress={handleRead}
        style={{
          backgroundColor: subTheme.primary,
          borderRadius: theme.radius.xl,
          paddingVertical: 14,
          paddingHorizontal: 20,
          flex: 2,
        }}
        accessibilityRole="button"
        accessibilityLabel={hasProgress ? 'Continue Reading' : 'Start Reading'}
        className="flex-row items-center justify-center gap-2 active:opacity-85 shadow-lg"
      >
        <Ionicons name="book" size={18} color="#071018" />
        <AppText variant="labelMedium" style={{ color: '#071018', fontWeight: '800' }}>
          {hasProgress ? 'Continue Reading' : 'Start Reading'}
        </AppText>
      </Pressable>

      {/* Download Action */}
      <Pressable
        onPress={onOpenDownloadSheet}
        style={{
          backgroundColor: isDownloaded ? 'rgba(87, 224, 183, 0.15)' : theme.colors.surface,
          borderColor: isDownloaded ? theme.colors.primary : theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.xl,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flex: 1,
        }}
        accessibilityRole="button"
        accessibilityLabel={isDownloaded ? 'Downloaded' : 'Download book'}
        className="flex-row items-center justify-center gap-1.5 active:opacity-75"
      >
        <Ionicons
          name={isDownloaded ? 'cloud-done' : 'cloud-download-outline'}
          size={18}
          color={isDownloaded ? theme.colors.primary : theme.colors.textPrimary}
        />
        <AppText
          variant="labelMedium"
          style={{
            color: isDownloaded ? theme.colors.primary : theme.colors.textPrimary,
            fontWeight: '600',
          }}
        >
          {isDownloaded ? 'Saved' : 'Offline'}
        </AppText>
      </Pressable>

      {/* Bookmark / Favorite Action */}
      <Pressable
        onPress={() => setIsSaved(!isSaved)}
        style={{
          backgroundColor: isSaved ? 'rgba(255, 107, 107, 0.15)' : theme.colors.surface,
          borderColor: isSaved ? '#FF6B6B' : theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.xl,
          padding: 14,
        }}
        accessibilityRole="button"
        accessibilityLabel={isSaved ? 'Book saved' : 'Save book'}
        className="items-center justify-center active:opacity-75"
      >
        <Ionicons
          name={isSaved ? 'bookmark' : 'bookmark-outline'}
          size={18}
          color={isSaved ? '#FF6B6B' : theme.colors.textPrimary}
        />
      </Pressable>
    </View>
  );
}
