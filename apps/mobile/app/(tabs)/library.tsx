import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { BookCard } from '@/components/BookCard';
import { Screen } from '@/components/Screen';
import { getBooks } from '@/lib/catalog';
import type { Book } from '@/data/demo';

const subjectTabs = [
  { id: 'all', label: 'All' },
  { id: 'physics', label: 'Physics' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'math', label: 'Higher Math' },
  { id: 'biology', label: 'Biology' },
];

export default function LibraryScreen() {
  const { data: books = [] } = useQuery({ queryKey: ['books'], queryFn: getBooks });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const filteredBooks = useMemo(() => {
    return books.filter((book: Book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.publisher.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject =
        selectedSubject === 'all' || book.subjectId === selectedSubject;

      return matchesSearch && matchesSubject;
    });
  }, [books, searchQuery, selectedSubject]);

  return (
    <Screen>
      <View className="mt-2 mb-4">
        <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-mint">
          HSCP Encrypted Books
        </Text>
        <Text className="mt-1 text-3xl font-black text-white">Library</Text>
        <Text className="mt-1 text-xs text-white/50">
          Protected textbooks, chapter mappings & offline packages
        </Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center rounded-2xl border border-white/10 bg-panel px-4 py-3">
        <Ionicons name="search" size={18} color="#6A7883" />
        <TextInput
          placeholder="Search textbook or publisher…"
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

      {/* Subject Filter Pills */}
      <View className="my-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {subjectTabs.map((tab) => {
            const active = selectedSubject === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setSelectedSubject(tab.id)}
                className={`rounded-full px-4 py-2 border ${
                  active
                    ? 'border-mint bg-mint/15'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    active ? 'text-mint' : 'text-white/60'
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Book List */}
      <View className="flex-1">
        {filteredBooks.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Ionicons name="search-outline" size={48} color="#4B5563" />
            <Text className="mt-4 text-base font-bold text-white">No books found</Text>
            <Text className="mt-1 text-xs text-white/40 text-center">
              Try adjusting your search query or subject filters
            </Text>
          </View>
        ) : (
          <FlashList
            data={filteredBooks}
            renderItem={({ item }) => <BookCard book={item as Book} />}
            keyExtractor={(item: any) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 110 }}
          />
        )}
      </View>
    </Screen>
  );
}
