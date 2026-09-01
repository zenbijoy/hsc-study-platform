import React from 'react';
import {
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import { useHomeScreen } from '../hooks/useHomeScreen';
import { HomeHeader } from '../components/HomeHeader';
import { renderHomeSection } from '../components/HomeSectionRegistry';
import { BookCardSkeleton } from '@/src/components/ui/Skeleton';

export function HomeScreen() {
  const theme = useTheme();
  const { viewModel, sections, isLoading, refreshing, onRefresh } = useHomeScreen();

  return (
    <SafeAreaView
      style={{ backgroundColor: theme.colors.background }}
      className="flex-1"
      edges={['top', 'left', 'right']}
    >
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
        {/* Header Greeting */}
        <HomeHeader
          greetingText={viewModel.greeting.greetingText}
          studentName={viewModel.greeting.studentName}
          academicContext={viewModel.greeting.academicContext}
        />

        {/* Dynamic Sections Feed */}
        {isLoading && viewModel.continueReading.length === 0 ? (
          <View className="gap-3 mt-2">
            <BookCardSkeleton />
            <BookCardSkeleton />
          </View>
        ) : (
          sections.map((section) => renderHomeSection(section, viewModel))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
