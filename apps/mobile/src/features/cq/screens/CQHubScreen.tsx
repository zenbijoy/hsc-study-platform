import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, RefreshControl, View } from 'react-native';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { SearchField } from '@/src/components/ui/SearchField';
import { useCQHub } from '../hooks/useCQHub';
import { CQHero } from '../components/CQHero';
import { CQFilterBar } from '../components/CQFilterBar';
import { CQBoardYearSelector } from '../components/CQBoardYearSelector';
import { CQCard } from '../components/CQCard';
import { CQPracticeScreen } from './CQPracticeScreen';

export function CQHubScreen() {
  const theme = useTheme();
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);

  const {
    cqs,
    totalCount,
    isLoading,
    refreshing,
    onRefresh,
    searchQuery,
    setSearchQuery,
    selectedSubject,
    setSelectedSubject,
    selectedBoard,
    setSelectedBoard,
    savedOnly,
    setSavedOnly,
    officialOnly,
    setOfficialOnly,
    savedItemIds,
    toggleSaveItem,
  } = useCQHub();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }} className="px-4 pt-2">
      {/* Top Search Field */}
      <View className="mb-3">
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search Creative Questions (ঢাকা বোর্ড, ভেক্টর, নদী ও নৌকা)…"
        />
      </View>

      {/* Main List */}
      <FlatList
        data={cqs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* CQ Hero Banner */}
            {!searchQuery && !savedOnly && (
              <CQHero onStartPractice={() => setIsPracticeModalOpen(true)} />
            )}

            {/* Subject Filters */}
            <CQFilterBar
              selectedSubject={selectedSubject}
              onSelectSubject={setSelectedSubject}
              officialOnly={officialOnly}
              onToggleOfficial={() => setOfficialOnly(!officialOnly)}
              savedOnly={savedOnly}
              onToggleSaved={() => setSavedOnly(!savedOnly)}
            />

            {/* Board Selector */}
            <CQBoardYearSelector
              selectedBoard={selectedBoard}
              onSelectBoard={setSelectedBoard}
            />

            <View className="flex-row items-center justify-between my-2">
              <AppText variant="labelLarge" color="secondary">
                {savedOnly ? 'Saved Questions' : selectedBoard !== 'all' ? `${selectedBoard} Questions` : 'Question Feed'}
              </AppText>
              <AppText variant="caption" color="muted">
                {totalCount} problems
              </AppText>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <CQCard
            cq={item}
            isSaved={savedItemIds.includes(item.id)}
            onToggleSave={() => toggleSaveItem(item.id)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator color={theme.colors.primary} size="large" />
              <AppText variant="bodyMedium" color="muted" className="mt-3">
                Loading board questions…
              </AppText>
            </View>
          ) : (
            <View className="py-12 items-center justify-center">
              <AppText variant="titleMedium" color="secondary">
                {savedOnly ? 'No saved questions yet' : 'No questions match your filter'}
              </AppText>
              <AppText variant="caption" color="muted" className="mt-1">
                {savedOnly ? 'Tap the star on any question to save it for practice.' : 'Try changing the subject, board, or search term.'}
              </AppText>
            </View>
          )
        }
      />

      {/* Practice Modal */}
      <Modal
        visible={isPracticeModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsPracticeModalOpen(false)}
      >
        <CQPracticeScreen
          questions={cqs}
          onClose={() => setIsPracticeModalOpen(false)}
        />
      </Modal>
    </View>
  );
}
