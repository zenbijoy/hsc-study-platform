import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import type { Subject } from '@/data/demo';

interface SubjectCardProps {
  subject: Subject;
  index?: number;
  onPress?: () => void;
}

export function SubjectCard({ subject, onPress }: SubjectCardProps) {
  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      className="w-[48%] overflow-hidden rounded-[28px] border border-white/10 active:opacity-95 shadow-md shadow-black/20"
    >
      <LinearGradient
        colors={[`${subject.accent}2E`, '#0D1822']}
        className="min-h-44 p-5 justify-between"
      >
        <View>
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <Ionicons name={subject.icon as any} size={24} color={subject.accent} />
          </View>
          <Text className="mt-5 text-lg font-black text-white">{subject.name}</Text>
          <Text className="mt-0.5 text-xs font-semibold text-white/55">{subject.banglaName}</Text>
        </View>

        <View className="mt-4">
          <View className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <View
              style={{ width: `${subject.progress}%`, backgroundColor: subject.accent }}
              className="h-full rounded-full"
            />
          </View>
          <Text className="mt-2 text-[11px] text-white/45">
            {subject.bookCount} books · {subject.progress}% mastered
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
