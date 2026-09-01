import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import type { Formula } from '@/data/demo';
import { useStudyStore } from '@/store/studyStore';

interface FormulaCardProps {
  item: Formula;
  index?: number;
  onPress?: () => void;
}

export function FormulaCard({ item, onPress }: FormulaCardProps) {
  const toggleFavorite = useStudyStore((state) => state.toggleFavoriteFormula);
  const isFavorite = useStudyStore((state) => state.isFormulaFavorite(item.id));

  return (
    <Pressable onPress={onPress} className="mb-3.5 active:opacity-95">
      <LinearGradient
        colors={['#16263A', '#0D1822']}
        className="rounded-[28px] border border-white/10 p-5 shadow-lg shadow-black/20"
      >
        <View className="flex-row items-center justify-between">
          <View className="rounded-full bg-sky/15 px-2.5 py-0.5">
            <Text className="text-[10px] font-bold uppercase tracking-[1px] text-sky">
              {item.chapter}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={12}
                  color={i < item.importance ? '#FBBF24' : '#2A3644'}
                />
              ))}
            </View>
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                toggleFavorite(item.id);
              }}
              className="p-1"
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? '#F43F5E' : '#6A7883'}
              />
            </Pressable>
          </View>
        </View>

        <Text className="mt-3 text-base font-bold text-white">{item.title}</Text>

        <View className="mt-3.5 rounded-2xl bg-black/25 px-4 py-4 border border-white/5 items-center">
          <Text className="text-xl font-black text-mint tracking-wide">{item.plain}</Text>
        </View>

        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-xs text-white/45">Used in {item.uses} board questions</Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-xs font-semibold text-mint">Inspect</Text>
            <Ionicons name="chevron-forward" size={14} color="#57E0B7" />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
