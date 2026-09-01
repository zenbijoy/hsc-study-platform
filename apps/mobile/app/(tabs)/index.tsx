import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { FormulaCard } from '@/components/FormulaCard';
import { FormulaDetailModal } from '@/components/FormulaDetailModal';
import { MCQQuizModal } from '@/components/MCQQuizModal';
import { Screen } from '@/components/Screen';
import { SubjectCard } from '@/components/SubjectCard';
import { demoMCQs, type Formula } from '@/data/demo';
import { getBooks, getFormulas, getSubjects } from '@/lib/catalog';
import { useStudyStore } from '@/store/studyStore';

export default function HomeScreen() {
  const router = useRouter();
  const { data: subjects = [] } = useQuery({ queryKey: ['subjects'], queryFn: getSubjects });
  const { data: formulas = [] } = useQuery({ queryKey: ['formulas'], queryFn: getFormulas });
  const { data: books = [] } = useQuery({ queryKey: ['books'], queryFn: getBooks });
  
  const streakDays = useStudyStore((state) => state.streakDays);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [quizModalVisible, setQuizModalVisible] = useState(false);

  const topBook = books[0];
  const formulaOfTheDay = formulas[0];

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Header with Streak Counter */}
        <View className="mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-white/45">
              HSC Exam Prep · 2026
            </Text>
            <Text className="mt-1 text-3xl font-black text-white">Ready to study?</Text>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5">
              <Ionicons name="flame" size={16} color="#FBBF24" />
              <Text className="text-xs font-black text-amber-300">{streakDays}d streak</Text>
            </View>
          </View>
        </View>

        {/* Continue Reading Card */}
        {topBook && (
          <Link
            href={{
              pathname: '/reader/[id]',
              params: { id: topBook.id, version: topBook.publishedVersionId ?? '' },
            }}
            asChild
          >
            <Pressable className="mt-6 overflow-hidden rounded-[32px] border border-white/10 active:opacity-95 shadow-xl shadow-black/30">
              <LinearGradient
                colors={['#236D79', '#1A3358', '#111A27']}
                className="p-6 justify-between"
              >
                <View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-bold uppercase tracking-[2px] text-mint">
                      Continue Reading
                    </Text>
                    <View className="rounded-full bg-white/10 px-2.5 py-0.5">
                      <Text className="text-[10px] font-bold text-white/80">Page 374 / 720</Text>
                    </View>
                  </View>

                  <Text className="mt-3 text-2xl font-black text-white">{topBook.title}</Text>
                  <Text className="mt-1 text-xs text-white/60">
                    Chapter 4: Newtonian Mechanics · HSC Protected Edition
                  </Text>
                </View>

                <View className="mt-6">
                  <View className="h-2 overflow-hidden rounded-full bg-black/30">
                    <View className="h-full w-[52%] rounded-full bg-mint" />
                  </View>
                  <View className="mt-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="rounded-full bg-white/10 px-2.5 py-1">
                        <Text className="text-[11px] font-semibold text-white">42 formulas</Text>
                      </View>
                      <View className="rounded-full bg-white/10 px-2.5 py-1">
                        <Text className="text-[11px] font-semibold text-white">50 linked CQs</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-xs font-bold text-mint">Resume</Text>
                      <Ionicons name="arrow-forward" size={14} color="#57E0B7" />
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          </Link>
        )}

        {/* Quick Practice Sprint Action Card */}
        <LinearGradient
          colors={['#A58BFF28', '#121626']}
          className="mt-4 overflow-hidden rounded-[28px] border border-[#A58BFF]/25 p-5"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="flash" size={16} color="#A58BFF" />
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-[#A58BFF]">
                  Daily Sprint
                </Text>
              </View>
              <Text className="mt-1 text-lg font-black text-white">5-Min MCQ Sprint</Text>
              <Text className="mt-0.5 text-xs text-white/50">
                Physics & Chemistry board standards
              </Text>
            </View>

            <Pressable
              onPress={() => setQuizModalVisible(true)}
              className="rounded-2xl bg-[#A58BFF] px-4 py-2.5 active:opacity-80"
            >
              <Text className="text-xs font-black text-[#0A0D18]">Start Quiz</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Explore Subjects */}
        <View className="mt-8 flex-row items-end justify-between">
          <Text className="text-xl font-black text-white">Explore Subjects</Text>
          <Link href="/library" asChild>
            <Pressable>
              <Text className="text-xs font-bold text-mint">View all books</Text>
            </Pressable>
          </Link>
        </View>

        <View className="mt-4 flex-row flex-wrap justify-between gap-y-4">
          {subjects.map((s: any, i: number) => (
            <SubjectCard
              key={s.id}
              subject={s}
              index={i}
              onPress={() => router.push('/library')}
            />
          ))}
        </View>

        {/* Formula of the Day */}
        {formulaOfTheDay && (
          <View className="mt-9">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-black text-white">Formula of the Day</Text>
              <Link href="/formulas" asChild>
                <Pressable>
                  <Text className="text-xs font-bold text-mint">Open vault</Text>
                </Pressable>
              </Link>
            </View>
            <View className="mt-3.5">
              <FormulaCard
                item={formulaOfTheDay}
                onPress={() => setSelectedFormula(formulaOfTheDay)}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <FormulaDetailModal
        visible={!!selectedFormula}
        formula={selectedFormula}
        onClose={() => setSelectedFormula(null)}
      />

      <MCQQuizModal
        visible={quizModalVisible}
        questions={demoMCQs}
        subjectTitle="Daily MCQ Sprint"
        onClose={() => setQuizModalVisible(false)}
      />
    </Screen>
  );
}
