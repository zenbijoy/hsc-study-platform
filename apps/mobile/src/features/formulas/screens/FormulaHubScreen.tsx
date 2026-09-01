import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, RefreshControl, View } from 'react-native';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { SearchField } from '@/src/components/ui/SearchField';
import { useFormulaHub } from '../hooks/useFormulaHub';
import { FormulaHero } from '../components/FormulaHero';
import { FormulaFilterBar } from '../components/FormulaFilterBar';
import { FormulaCard } from '../components/FormulaCard';
import { FormulaRevisionScreen } from './FormulaRevisionScreen';

export function FormulaHubScreen() {
  const theme = useTheme();
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

  const {
    formulas,
    totalCount,
    isLoading,
    refreshing,
    onRefresh,
    searchQuery,
    setSearchQuery,
    selectedSubject,
    setSelectedSubject,
    savedOnly,
    setSavedOnly,
    favoriteFormulaIds,
    toggleFavoriteFormula,
  } = useFormulaHub();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }} className="px-4 pt-2">
      {/* Top Search Field */}
      <View className="mb-3">
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search formulas, variables (বেগ, ত্বরণ, v=u+at)…"
        />
      </View>

      {/* Main List */}
      <FlatList
        data={formulas}
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
            {/* Vault Hero Banner */}
            {!searchQuery && !savedOnly && (
              <FormulaHero onStartRevision={() => setIsRevisionModalOpen(true)} />
            )}

            {/* Subject Filters */}
            <FormulaFilterBar
              selectedSubject={selectedSubject}
              onSelectSubject={setSelectedSubject}
              savedOnly={savedOnly}
              onToggleSaved={() => setSavedOnly(!savedOnly)}
            />

            <View className="flex-row items-center justify-between my-2">
              <AppText variant="labelLarge" color="secondary">
                {savedOnly ? 'Saved Formulas' : 'Formula Catalog'}
              </AppText>
              <AppText variant="caption" color="muted">
                {totalCount} equations
              </AppText>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <FormulaCard
            formula={item}
            isSaved={favoriteFormulaIds.includes(item.id)}
            onToggleSave={() => toggleFavoriteFormula(item.id)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator color={theme.colors.primary} size="large" />
              <AppText variant="bodyMedium" color="muted" className="mt-3">
                Loading formula catalog…
              </AppText>
            </View>
          ) : (
            <View className="py-12 items-center justify-center">
              <AppText variant="titleMedium" color="secondary">
                {savedOnly ? 'No saved formulas yet' : 'No formulas match your search'}
              </AppText>
              <AppText variant="caption" color="muted" className="mt-1">
                {savedOnly ? 'Tap the star on any formula to save it for quick revision.' : 'Try searching for variables or standard English/Bengali names.'}
              </AppText>
            </View>
          )
        }
      />

      {/* Revision Modal */}
      <Modal
        visible={isRevisionModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsRevisionModalOpen(false)}
      >
        <FormulaRevisionScreen
          formulas={formulas}
          onClose={() => setIsRevisionModalOpen(false)}
        />
      </Modal>
    </View>
  );
}
