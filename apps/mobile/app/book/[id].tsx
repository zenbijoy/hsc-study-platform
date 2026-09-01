import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ChapterListModal } from '@/components/ChapterListModal';
import { ProtectedDownloadButton } from '@/components/ProtectedDownloadButton';
import { Screen } from '@/components/Screen';
import { demoChapters, type Book, type Chapter } from '@/data/demo';
import { getBooks } from '@/lib/catalog';

export default function BookDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: books = [] } = useQuery({ queryKey: ['books'], queryFn: getBooks });
  const book = books.find((b: any) => b.id === id) ?? books[0];
  const [chapterModalVisible, setChapterModalVisible] = useState(false);

  if (!book) {
    return (
      <Screen>
        <Text className="mt-20 text-center text-white/60">Book not found.</Text>
      </Screen>
    );
  }

  const bookChapters =
    demoChapters.filter((c) => c.bookId === book.id) || [];

  const handleSelectChapter = (chapter: Chapter) => {
    router.push({
      pathname: '/reader/[id]',
      params: {
        id: book.id,
        version: book.publishedVersionId ?? '',
        initialPage: chapter.startPage.toString(),
      },
    });
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Top Header */}
        <View className="mt-2 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-white/5 active:bg-white/10"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </Pressable>
          <View className="flex-row items-center gap-1.5 rounded-full bg-mint/15 px-3 py-1">
            <Ionicons name="shield-checkmark" size={16} color="#57E0B7" />
            <Text className="text-xs font-bold text-mint">HSCP Protected</Text>
          </View>
        </View>

        {/* Hero Card */}
        <LinearGradient
          colors={['#193954', '#101A26']}
          className="mt-6 rounded-[34px] border border-white/10 p-7 shadow-2xl shadow-black/30"
        >
          <Text className="text-xs font-bold uppercase tracking-[2px] text-mint">
            HSC National Curriculum Edition
          </Text>
          <Text className="mt-3 text-3xl font-black text-white">{book.title}</Text>
          <Text className="mt-1 text-xs text-white/50">{book.publisher}</Text>

          {/* Stat Badges */}
          <View className="mt-6 flex-row flex-wrap gap-2">
            {[
              `${book.pages} pages`,
              `${book.chapters} chapters`,
              `${book.formulas} formulas`,
            ].map((x) => (
              <View key={x} className="rounded-full bg-white/10 px-3 py-1.5">
                <Text className="text-xs font-bold text-white">{x}</Text>
              </View>
            ))}
          </View>

          {/* Progress Bar */}
          <View className="mt-7">
            <View className="flex-row items-center justify-between text-xs text-white/40 mb-2">
              <Text className="text-xs text-white/50">Reading Progress</Text>
              <Text className="text-xs font-bold text-mint">
                {Math.round(book.progress * 100)}%
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-black/30">
              <View
                className="h-full rounded-full bg-mint"
                style={{ width: `${book.progress * 100}%` }}
              />
            </View>
            <Text className="mt-2 text-xs text-white/45">
              Continue from page {book.lastPage} of {book.pages}
            </Text>
          </View>
        </LinearGradient>

        {/* Primary Reader Action */}
        <Link
          href={{
            pathname: '/reader/[id]',
            params: { id: book.id, version: book.publishedVersionId ?? '' },
          }}
          asChild
        >
          <Pressable className="mt-5 items-center rounded-[24px] bg-mint py-4 active:bg-mint/80 shadow-lg shadow-mint/20">
            <Text className="text-base font-black text-ink">Open Protected Reader</Text>
          </Pressable>
        </Link>

        {/* Download Button */}
        <ProtectedDownloadButton bookVersionId={book.publishedVersionId} />

        {/* Chapter Index Section */}
        <View className="mt-8">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-black text-white">Chapter Intelligence</Text>
            <Pressable onPress={() => setChapterModalVisible(true)}>
              <Text className="text-xs font-bold text-mint">View full index</Text>
            </Pressable>
          </View>

          <View className="mt-4 gap-3">
            {bookChapters.slice(0, 5).map((chapter) => (
              <Pressable
                key={chapter.id}
                onPress={() => handleSelectChapter(chapter)}
                className="flex-row items-center justify-between rounded-2xl border border-white/8 bg-panel p-4 active:bg-white/10"
              >
                <View className="flex-row items-center flex-1 pr-3">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-sky/15 mr-3">
                    <Text className="font-black text-sky">
                      {String(chapter.chapterNumber).padStart(2, '0')}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-white" numberOfLines={1}>
                      {chapter.title}
                    </Text>
                    <Text className="text-xs text-white/40">
                      pp. {chapter.startPage}–{chapter.endPage} · {chapter.formulaCount} formulas · {chapter.cqCount} CQs
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" color="#6A7883" size={18} />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Chapter List Modal */}
      <ChapterListModal
        visible={chapterModalVisible}
        chapters={bookChapters}
        bookTitle={book.title}
        onClose={() => setChapterModalVisible(false)}
        onSelectChapter={handleSelectChapter}
      />
    </Screen>
  );
}
