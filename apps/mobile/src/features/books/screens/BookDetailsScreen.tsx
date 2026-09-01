import React from 'react';
import {
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { EmptyState } from '@/src/components/ui/FeedbackStates';
import { BookCardSkeleton, ChapterCardSkeleton } from '@/src/components/ui/Skeleton';
import { useBookDetails } from '../hooks/useBookDetails';
import { BookDetailsHero } from '../components/BookDetailsHero';
import { BookPrimaryActions } from '../components/BookPrimaryActions';
import { BookProgressCard } from '../components/BookProgressCard';
import { BookStats } from '../components/BookStats';
import { BookChapterList } from '../components/BookChapterList';
import { BookDownloadSheet } from '../components/BookDownloadSheet';
import { RelatedStudyTools } from '../components/RelatedStudyTools';

export function BookDetailsScreen({ bookId }: { bookId: string }) {
  const theme = useTheme();
  const router = useRouter();
  const {
    viewModel,
    isLoading,
    refreshing,
    onRefresh,
    isNotFound,
    isDownloadSheetOpen,
    setIsDownloadSheetOpen,
    startDownload,
  } = useBookDetails(bookId);

  if (isNotFound) {
    return (
      <SafeAreaView
        style={{ backgroundColor: theme.colors.background }}
        className="flex-1 justify-center px-6"
      >
        <EmptyState
          icon="alert-circle-outline"
          title="Book Not Found"
          description="This textbook is not currently available or has been unlisted."
          actionLabel="Back to Library"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: theme.colors.background }}
      className="flex-1"
      edges={['top', 'left', 'right']}
    >
      <AppHeader
        title={viewModel?.book.title || 'Book Details'}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.screenHorizontal,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {isLoading && !viewModel ? (
          <View className="gap-3 mt-4">
            <BookCardSkeleton />
            <ChapterCardSkeleton />
            <ChapterCardSkeleton />
          </View>
        ) : viewModel ? (
          <>
            {/* Book Details Hero */}
            <BookDetailsHero
              book={viewModel.book}
              isDownloaded={viewModel.download.isReady}
            />

            {/* Primary Action Row */}
            <BookPrimaryActions
              viewModel={viewModel}
              onOpenDownloadSheet={() => setIsDownloadSheetOpen(true)}
            />

            {/* Reading Progress */}
            <BookProgressCard viewModel={viewModel} />

            {/* Book Stats */}
            <BookStats viewModel={viewModel} />

            {/* Chapter Map */}
            <BookChapterList
              bookId={bookId}
              subjectId={viewModel.book.subjectId}
              chapters={viewModel.chapters}
            />

            {/* Related Study Tools */}
            <RelatedStudyTools
              bookId={bookId}
              subjectId={viewModel.book.subjectId}
            />
          </>
        ) : null}
      </ScrollView>

      {/* Download Bottom Sheet */}
      {viewModel && (
        <BookDownloadSheet
          visible={isDownloadSheetOpen}
          onClose={() => setIsDownloadSheetOpen(false)}
          viewModel={viewModel}
          onStartDownload={startDownload}
        />
      )}
    </SafeAreaView>
  );
}
