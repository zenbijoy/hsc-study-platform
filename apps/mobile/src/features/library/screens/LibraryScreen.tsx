import React from 'react';
import {
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import { useLibraryScreen } from '../hooks/useLibraryScreen';
import { LibraryHeader } from '../components/LibraryHeader';
import { LibrarySearchBar } from '../components/LibrarySearchBar';
import { LibraryFilterBar } from '../components/LibraryFilterBar';
import { ActiveFilterChips } from '../components/ActiveFilterChips';
import { LibraryBookGrid } from '../components/LibraryBookGrid';
import { LibraryBookList } from '../components/LibraryBookList';
import { LibrarySortSheet } from '../components/LibrarySortSheet';
import { LibraryFilterSheet } from '../components/LibraryFilterSheet';
import { EmptyState } from '@/src/components/ui/FeedbackStates';
import { BookCardSkeleton } from '@/src/components/ui/Skeleton';
import { AppText } from '@/src/components/ui/Typography';

export function LibraryScreen(props?: {
  subjectId?: string;
  paperNumber?: number;
  downloadedOnly?: boolean;
}) {
  const theme = useTheme();
  const {
    viewModel,
    isLoading,
    refreshing,
    onRefresh,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    sortOption,
    setSortOption,
    filters,
    setFilters,
    setSubjectFilter,
    toggleDownloadedOnly,
    clearAllFilters,
    isFilterSheetOpen,
    setIsFilterSheetOpen,
    isSortSheetOpen,
    setIsSortSheetOpen,
  } = useLibraryScreen(props);

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
        {/* Header */}
        <LibraryHeader
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          activeFilterCount={viewModel.activeFilterCount}
          onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
          sortOption={sortOption}
          onOpenSortSheet={() => setIsSortSheetOpen(true)}
        />

        {/* Search Bar */}
        <LibrarySearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Quick Filter Bar */}
        <LibraryFilterBar
          selectedSubjectIds={filters.subjectIds}
          onSelectSubject={(id) => {
            if (!id) {
              setFilters((prev) => ({ ...prev, subjectIds: [], downloadedOnly: false }));
            } else {
              setSubjectFilter(id);
            }
          }}
          downloadedOnly={filters.downloadedOnly}
          onToggleDownloaded={toggleDownloadedOnly}
        />

        {/* Active Filter Chips */}
        <ActiveFilterChips
          filters={filters}
          onClearSubject={(subId) =>
            setFilters((prev) => ({
              ...prev,
              subjectIds: prev.subjectIds.filter((id) => id !== subId),
            }))
          }
          onClearPaper={(pNum) =>
            setFilters((prev) => ({
              ...prev,
              paperNumbers: prev.paperNumbers.filter((p) => p !== pNum),
            }))
          }
          onClearDownloaded={() =>
            setFilters((prev) => ({ ...prev, downloadedOnly: false }))
          }
          onClearAll={clearAllFilters}
        />

        {/* Catalog Count Summary */}
        <View className="flex-row items-center justify-between mb-3">
          <AppText variant="labelMedium" color="primary" style={{ fontWeight: '700' }}>
            {filters.downloadedOnly
              ? 'Offline Books'
              : filters.subjectIds.length === 1
              ? `${filters.subjectIds[0]} Textbooks`
              : 'All Textbooks'}
          </AppText>
          <AppText variant="caption" color="muted">
            {viewModel.totalCount} books found
          </AppText>
        </View>

        {/* Main Books Catalog */}
        {isLoading && viewModel.books.length === 0 ? (
          <View className="flex-row flex-wrap gap-2">
            <BookCardSkeleton />
            <BookCardSkeleton />
          </View>
        ) : viewModel.books.length === 0 ? (
          <EmptyState
            icon="book-outline"
            title="No Books Found"
            description="Try changing your search query or removing some active filters."
            actionLabel="Clear Filters"
            onAction={clearAllFilters}
          />
        ) : viewMode === 'grid' ? (
          <LibraryBookGrid books={viewModel.books} />
        ) : (
          <LibraryBookList books={viewModel.books} />
        )}
      </ScrollView>

      {/* Sort Sheet Modal */}
      <LibrarySortSheet
        visible={isSortSheetOpen}
        onClose={() => setIsSortSheetOpen(false)}
        selectedSort={sortOption}
        onSelectSort={setSortOption}
      />

      {/* Filter Sheet Modal */}
      <LibraryFilterSheet
        visible={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
      />
    </SafeAreaView>
  );
}
