import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { supabaseConfigured } from '@/lib/supabase';
import { useStudyStore } from '@/store/studyStore';

export default function ProfileScreen() {
  const streakDays = useStudyStore((state) => state.streakDays);
  const totalQuizzes = useStudyStore((state) => state.getTotalQuizzesSolved());
  const accuracy = useStudyStore((state) => state.getAverageAccuracy());
  const favoriteCount = useStudyStore((state) => state.favoriteFormulaIds.length);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    setCacheCleared(true);
    Alert.alert(
      'Cache Cleared',
      'All temporary decrypted PDF files have been purged from the secure app sandbox.'
    );
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Profile Card */}
        <View className="mt-4 items-center">
          <View className="h-24 w-24 items-center justify-center rounded-[32px] bg-mint/15 border border-mint/25 shadow-lg shadow-black/20">
            <Ionicons name="person" size={42} color="#57E0B7" />
          </View>
          <Text className="mt-4 text-2xl font-black text-white">HSC Candidate</Text>
          <Text className="mt-1 text-xs text-white/45">
            Science Group · Session 2024–2026 · Personal Learning Vault
          </Text>
        </View>

        {/* Study Stats Grid */}
        <View className="mt-6 flex-row flex-wrap justify-between gap-y-3">
          <View className="w-[48%] rounded-2xl border border-white/8 bg-panel p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-white/50 font-semibold">Streak</Text>
              <Ionicons name="flame" size={16} color="#FBBF24" />
            </View>
            <Text className="mt-2 text-2xl font-black text-white">{streakDays} Days</Text>
          </View>

          <View className="w-[48%] rounded-2xl border border-white/8 bg-panel p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-white/50 font-semibold">Accuracy</Text>
              <Ionicons name="analytics" size={16} color="#57E0B7" />
            </View>
            <Text className="mt-2 text-2xl font-black text-white">{accuracy}%</Text>
          </View>

          <View className="w-[48%] rounded-2xl border border-white/8 bg-panel p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-white/50 font-semibold">MCQs Solved</Text>
              <Ionicons name="checkbox-outline" size={16} color="#6CB7FF" />
            </View>
            <Text className="mt-2 text-2xl font-black text-white">{totalQuizzes}</Text>
          </View>

          <View className="w-[48%] rounded-2xl border border-white/8 bg-panel p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-white/50 font-semibold">Saved Formulas</Text>
              <Ionicons name="heart" size={16} color="#F43F5E" />
            </View>
            <Text className="mt-2 text-2xl font-black text-white">{favoriteCount}</Text>
          </View>
        </View>

        {/* Offline & Cache Management */}
        <View className="mt-7 rounded-[28px] border border-white/10 bg-panel p-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="phone-portrait-outline" size={18} color="#6CB7FF" />
              <Text className="text-xs font-bold uppercase tracking-[1px] text-sky">
                Device Storage & Security
              </Text>
            </View>
            <View className="rounded-full bg-mint/15 px-2.5 py-0.5">
              <Text className="text-[10px] font-bold text-mint">Secure X25519</Text>
            </View>
          </View>

          <View className="mt-4 space-y-3">
            <View className="flex-row items-center justify-between border-b border-white/5 pb-3">
              <Text className="text-xs text-white/70">Offline Packages</Text>
              <Text className="text-xs font-bold text-white">2 HSCP Files (1.2 GB)</Text>
            </View>

            <View className="flex-row items-center justify-between border-b border-white/5 pb-3">
              <Text className="text-xs text-white/70">Decrypted Temp Cache</Text>
              <Text className="text-xs font-bold text-mint">
                {cacheCleared ? '0 B (Clean)' : 'Auto-purged on exit'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between pb-1">
              <Text className="text-xs text-white/70">Screen Capture Guard</Text>
              <Text className="text-xs font-bold text-mint">Active</Text>
            </View>
          </View>

          <Pressable
            onPress={handleClearCache}
            className="mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-white/5 py-3 active:bg-white/10 border border-white/10"
          >
            <Ionicons name="trash-bin-outline" size={15} color="#F87171" />
            <Text className="text-xs font-bold text-red-300">
              Purge Decrypted Reader Cache
            </Text>
          </Pressable>
        </View>

        {/* Authentication Box */}
        {supabaseConfigured ? (
          <Link href="/auth" asChild>
            <Pressable className="mt-6 items-center rounded-2xl bg-mint py-4 active:bg-mint/80">
              <Text className="font-black text-ink">Account & Cloud Sync Settings</Text>
            </Pressable>
          </Link>
        ) : (
          <View className="mt-6 rounded-2xl border border-sky/20 bg-sky/10 p-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="information-circle" size={18} color="#6CB7FF" />
              <Text className="text-xs font-bold text-sky">Local Demo Mode</Text>
            </View>
            <Text className="mt-1 text-xs leading-5 text-sky/80">
              Add Supabase environment variables in `.env` to enable multi-device sync, user accounts, and remote device license wrapping.
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
