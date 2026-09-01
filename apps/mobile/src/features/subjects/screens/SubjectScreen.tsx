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
import { IconButton } from '@/src/components/ui/IconButton';
import { EmptyState } from '@/src/components/ui/FeedbackStates';
import { SubjectCardSkeleton, ChapterCardSkeleton } from '@/src/components/ui/Skeleton';
import { useSubjectScreen } from '../hooks/useSubjectScreen';
import { SubjectHero } from '../components/SubjectHero';
import { PaperSelector } from '../components/PaperSelector';
import { SubjectStats } from '../components/SubjectStats';
import { SubjectQuickActions } from '../components/SubjectQuickActions';
import { ContinueSubjectStudy } from '../components/ContinueSubjectStudy';
import { ChapterSection } from '../components/ChapterSection';
import { ImportantFormulaPreview } from '../components/ImportantFormulaPreview';

export function SubjectScreen({ subjectId }: { subjectId: string }) {
  const theme = useTheme();
  const router = useRouter();
  const {
    viewModel,
    selectedPaperNumber,
    setSelectedPaperNumber,
    isLoading,
    refreshing,
    onRefresh,
    isNotFound,
  } = useSubjectScreen(subjectId);

  if (isNotFound) {
    return (
      <SafeAreaView
        style={{ backgroundColor: theme.colors.background }}
        className="flex-1 justify-center px-6"
      >
        <EmptyState
          icon="alert-circle-outline"
          title="Subject Unavailable"
          description="This subject may have been removed or is not available for your syllabus."
          actionLabel="Back to Home"
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
        title={viewModel?.subject.banglaName || 'Subject Explorer'}
        showBack
        onBack={() => router.back()}
        rightAction={
          <IconButton
            name="search-outline"
            variant="surface"
            onPress={() => router.push('/(tabs)/library' as any)}
            accessibilityLabel="Search in library"
          />
        }
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
            <SubjectCardSkeleton />
            <ChapterCardSkeleton />
            <ChapterCardSkeleton />
          </View>
        ) : viewModel ? (
          <>
            {/* Subject Hero */}
            <SubjectHero
              subject={viewModel.subject}
              overallProgress={viewModel.stats.overallProgress}
            />

            {/* Paper Tabs Selector */}
            <PaperSelector
              subjectId={subjectId}
              papers={viewModel.papers}
              selectedPaperNumber={selectedPaperNumber}
              onSelectPaper={(pNum) => setSelectedPaperNumber(pNum)}
            />

            {/* Quick Actions */}
            <SubjectQuickActions
              subjectId={subjectId}
              paperNumber={selectedPaperNumber}
            />

            {/* In-Progress / Up-Next Chapter */}
            <ContinueSubjectStudy
              subjectId={subjectId}
              context={viewModel.continueStudy}
            />

            {/* Stats Overview */}
            <SubjectStats subjectId={subjectId} stats={viewModel.stats} />

            {/* Syllabus Chapters List */}
            <ChapterSection
              chapters={viewModel.chapters}
              paperTitle={viewModel.selectedPaper?.titleBn}
            />

            {/* Formula Preview */}
            <ImportantFormulaPreview formulas={viewModel.formulasPreview} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
