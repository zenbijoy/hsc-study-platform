import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { FormulaCard } from '@/components/FormulaCard';
import { FormulaDetailModal } from '@/components/FormulaDetailModal';
import { Screen } from '@/components/Screen';
import { getFormulas } from '@/lib/catalog';
import { useStudyStore } from '@/store/studyStore';
import type { Formula } from '@/data/demo';

const subjectTabs = [
  { id: 'all', label: 'All Subjects' },
  { id: 'physics', label: 'Physics' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'math', label: 'Higher Math' },
];

export default function FormulaScreen() {
  const { data: rawFormulas = [] } = useQuery({ queryKey: ['formulas'], queryFn: getFormulas });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);

  const favoriteFormulaIds = useStudyStore((state) => state.favoriteFormulaIds);

  const filteredFormulas = useMemo(() => {
    return rawFormulas.filter((f: Formula) => {
      const matchesSearch =
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.plain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.latex.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject =
        selectedSubject === 'all' || f.subjectId === selectedSubject;

      const matchesFavorite = !onlyFavorites || favoriteFormulaIds.includes(f.id);

      return matchesSearch && matchesSubject && matchesFavorite;
    });
  }, [rawFormulas, searchQuery, selectedSubject, onlyFavorites, favoriteFormulaIds]);

  return (
    <Screen>
      <View className="mt-2 mb-4">
        <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-sky">
          Formula Knowledge Graph
        </Text>
        <Text className="mt-1 text-3xl font-black text-white">Formula Vault</Text>
        <Text className="mt-1 text-xs text-white/50">
          Searchable LaTeX formulas · SI unit breakdowns · linked to board CQs
        </Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center rounded-2xl border border-white/10 bg-panel px-4 py-3">
        <Ionicons name="search" size={18} color="#6A7883" />
        <TextInput
          placeholder="Search formula, variable (F=ma), or chapter…"
          placeholderTextColor="#6A7883"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="ml-2.5 flex-1 text-sm font-semibold text-white"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#6A7883" />
          </Pressable>
        )}
      </View>

      {/* Subject Filter Pills & Favorite Toggle */}
      <View className="my-4 flex-row items-center justify-between">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          className="flex-1 pr-2"
        >
          {subjectTabs.map((tab) => {
            const active = selectedSubject === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setSelectedSubject(tab.id)}
                className={`rounded-full px-4 py-2 border ${
                  active
                    ? 'border-sky bg-sky/15'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    active ? 'text-sky' : 'text-white/60'
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          onPress={() => setOnlyFavorites(!onlyFavorites)}
          className={`h-9 w-9 items-center justify-center rounded-full border ${
            onlyFavorites
              ? 'border-rose-400 bg-rose-400/20'
              : 'border-white/10 bg-white/5'
          }`}
        >
          <Ionicons
            name={onlyFavorites ? 'heart' : 'heart-outline'}
            size={18}
            color={onlyFavorites ? '#F43F5E' : '#6A7883'}
          />
        </Pressable>
      </View>

      {/* Formulas List */}
      <View className="flex-1">
        {filteredFormulas.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Ionicons name="calculator-outline" size={48} color="#4B5563" />
            <Text className="mt-4 text-base font-bold text-white">No formulas matched</Text>
            <Text className="mt-1 text-xs text-white/40 text-center">
              Try changing search terms or disabling the favorites filter
            </Text>
          </View>
        ) : (
          <FlashList
            data={filteredFormulas}
            renderItem={({ item }) => (
              <FormulaCard
                item={item as Formula}
                onPress={() => setSelectedFormula(item as Formula)}
              />
            )}
            keyExtractor={(item: any) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 110 }}
          />
        )}
      </View>

      {/* Formula Detail Modal */}
      <FormulaDetailModal
        visible={!!selectedFormula}
        formula={selectedFormula}
        onClose={() => setSelectedFormula(null)}
      />
    </Screen>
  );
}
