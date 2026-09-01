import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import type { Book } from '@/data/demo';

interface BookCardProps {
  book: Book;
  onOpenChapters?: () => void;
}

export function BookCard({ book, onOpenChapters }: BookCardProps) {
  return (
    <Link href={{ pathname: '/book/[id]', params: { id: book.id } }} asChild>
      <Pressable className="mb-4 overflow-hidden rounded-[28px] border border-white/10 active:opacity-95 shadow-lg shadow-black/20">
        <LinearGradient colors={['#14283A', '#0C1720']} className="p-5">
          <View className="flex-row gap-4">
            <View className="h-28 w-20 items-center justify-center rounded-2xl bg-sky/15 border border-sky/20">
              <Ionicons name="book-outline" size={32} color="#6CB7FF" />
            </View>
            <View className="flex-1 justify-between">
              <View>
                <View className="flex-row items-start justify-between">
                  <Text className="text-base font-bold text-white flex-1 pr-2" numberOfLines={1}>
                    {book.title}
                  </Text>
                  {book.protected && (
                    <View className="flex-row items-center gap-1 rounded-full bg-mint/15 px-2 py-0.5">
                      <Ionicons name="shield-checkmark" size={12} color="#57E0B7" />
                      <Text className="text-[10px] font-bold text-mint">HSCP</Text>
                    </View>
                  )}
                </View>
                <Text className="mt-1 text-xs text-white/50" numberOfLines={1}>
                  {book.subtitle}
                </Text>
              </View>

              <View>
                <View className="flex-row items-center justify-between text-xs text-white/45">
                  <Text className="text-[11px] text-white/40">
                    {book.pages} pages · {book.chapters} chapters
                  </Text>
                  <Text className="text-[11px] font-bold text-mint">
                    {Math.round(book.progress * 100)}%
                  </Text>
                </View>
                <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <View
                    style={{ width: `${book.progress * 100}%` }}
                    className="h-full rounded-full bg-mint"
                  />
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Link>
  );
}
