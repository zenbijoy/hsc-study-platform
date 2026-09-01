import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CQViewerModal } from '@/components/CQViewerModal';
import { MCQQuizModal } from '@/components/MCQQuizModal';
import { Screen } from '@/components/Screen';
import { demoCQs, demoMCQs, type CQQuestion } from '@/data/demo';
import { useStudyStore } from '@/store/studyStore';

export default function PracticeScreen() {
  const [activeTab, setActiveTab] = useState<'mcq' | 'cq'>('mcq');
  const [selectedCQ, setSelectedCQ] = useState<CQQuestion | null>(null);
  const [mcqModalVisible, setMcqModalVisible] = useState(false);

  const totalQuizzesSolved = useStudyStore((state) => state.getTotalQuizzesSolved());
  const averageAccuracy = useStudyStore((state) => state.getAverageAccuracy());

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mt-2 mb-4">
          <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-[#A58BFF]">
            Adaptive Practice Engine
          </Text>
          <Text className="mt-1 text-3xl font-black text-white">Practice Lab</Text>
          <Text className="mt-1 text-xs text-white/50">
            Interactive MCQs with step derivations · Board Creative Questions (CQ)
          </Text>
        </View>

        {/* Analytics Snapshot */}
        <View className="flex-row gap-3">
          <LinearGradient
            colors={['#A58BFF28', '#101524']}
            className="flex-1 rounded-[24px] border border-[#A58BFF]/25 p-4"
          >
            <View className="h-8 w-8 items-center justify-center rounded-xl bg-[#A58BFF]/20">
              <Ionicons name="checkbox-outline" size={18} color="#A58BFF" />
            </View>
            <Text className="mt-3 text-2xl font-black text-white">{totalQuizzesSolved}</Text>
            <Text className="mt-0.5 text-[11px] font-semibold text-white/50">Questions Solved</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#57E0B728', '#0C1C20']}
            className="flex-1 rounded-[24px] border border-mint/25 p-4"
          >
            <View className="h-8 w-8 items-center justify-center rounded-xl bg-mint/20">
              <Ionicons name="analytics-outline" size={18} color="#57E0B7" />
            </View>
            <Text className="mt-3 text-2xl font-black text-white">{averageAccuracy}%</Text>
            <Text className="mt-0.5 text-[11px] font-semibold text-white/50">Average Accuracy</Text>
          </LinearGradient>
        </View>

        {/* Tab Switcher: MCQ Sprint vs Board CQs */}
        <View className="mt-6 flex-row rounded-2xl border border-white/10 bg-panel p-1">
          <Pressable
            onPress={() => setActiveTab('mcq')}
            className={`flex-1 items-center rounded-xl py-2.5 ${
              activeTab === 'mcq' ? 'bg-mint' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-black ${
                activeTab === 'mcq' ? 'text-ink' : 'text-white/60'
              }`}
            >
              MCQ Sprints
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('cq')}
            className={`flex-1 items-center rounded-xl py-2.5 ${
              activeTab === 'cq' ? 'bg-mint' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-black ${
                activeTab === 'cq' ? 'text-ink' : 'text-white/60'
              }`}
            >
              Board CQs
            </Text>
          </Pressable>
        </View>

        {activeTab === 'mcq' ? (
          /* MCQ Sprint Section */
          <View className="mt-6 gap-4">
            {/* Quick Launch Card */}
            <LinearGradient
              colors={['#2A1B4E', '#101426']}
              className="rounded-[30px] border border-[#A58BFF]/30 p-6 shadow-xl shadow-black/30"
            >
              <View className="flex-row items-center justify-between">
                <View className="rounded-full bg-[#A58BFF]/20 px-3 py-1">
                  <Text className="text-[10px] font-bold uppercase tracking-[1px] text-[#A58BFF]">
                    HSC Quick Quiz
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="time-outline" size={14} color="#A58BFF" />
                  <Text className="text-xs text-white/60">5 mins</Text>
                </View>
              </View>

              <Text className="mt-4 text-xl font-black text-white">
                Physics & Math Sprint Test
              </Text>
              <Text className="mt-1 text-xs text-white/60">
                5 curated questions covering Dynamics, Mechanics, and Calculus.
              </Text>

              <Pressable
                onPress={() => setMcqModalVisible(true)}
                className="mt-6 flex-row items-center justify-center gap-2 rounded-2xl bg-[#A58BFF] py-3.5 active:opacity-85"
              >
                <Ionicons name="play" size={16} color="#0B0E1B" />
                <Text className="text-sm font-black text-[#0B0E1B]">Launch MCQ Sprint</Text>
              </Pressable>
            </LinearGradient>

            {/* List of Topic Quizzes */}
            <Text className="mt-4 text-sm font-bold uppercase tracking-[1px] text-white/40">
              Chapter Question Banks
            </Text>

            {[
              { title: 'Newtonian Mechanics', chapter: 'Physics 1st Paper', count: '110 MCQs', color: '#6CB7FF' },
              { title: 'Qualitative Chemistry', chapter: 'Chemistry 1st Paper', count: '110 MCQs', color: '#57E0B7' },
              { title: 'Vectors & Forces', chapter: 'Physics 1st Paper', count: '82 MCQs', color: '#A58BFF' },
            ].map((q) => (
              <Pressable
                key={q.title}
                onPress={() => setMcqModalVisible(true)}
                className="flex-row items-center justify-between rounded-2xl border border-white/8 bg-panel p-4 active:bg-white/10"
              >
                <View className="flex-row items-center flex-1 pr-3">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl mr-3"
                    style={{ backgroundColor: `${q.color}20` }}
                  >
                    <Ionicons name="help-circle-outline" size={22} color={q.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-white">{q.title}</Text>
                    <Text className="text-xs text-white/45">{q.chapter}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <View className="rounded-full bg-white/5 px-2.5 py-1">
                    <Text className="text-[10px] font-bold text-white/70">{q.count}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#6A7883" />
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          /* Board CQ Section */
          <View className="mt-6 gap-3.5">
            <Text className="text-sm font-bold uppercase tracking-[1px] text-white/40">
              Board Creative Questions (CQ)
            </Text>

            {demoCQs.map((cq) => (
              <Pressable
                key={cq.id}
                onPress={() => setSelectedCQ(cq)}
                className="rounded-[26px] border border-white/10 bg-panel p-5 active:bg-white/10 shadow-lg shadow-black/20"
              >
                <View className="flex-row items-center justify-between">
                  <View className="rounded-full bg-mint/15 px-2.5 py-0.5">
                    <Text className="text-[10px] font-bold uppercase text-mint">{cq.chapter}</Text>
                  </View>
                  <Text className="text-xs text-white/40">
                    {cq.board} · {cq.year}
                  </Text>
                </View>

                <Text className="mt-3 text-base font-bold text-white leading-6">{cq.title}</Text>
                <Text className="mt-2 text-xs text-white/50 leading-5" numberOfLines={2}>
                  {cq.stimulus}
                </Text>

                <View className="mt-4 flex-row items-center justify-between border-t border-white/5 pt-3">
                  <View className="flex-row items-center gap-1.5">
                    <View className="rounded-md bg-white/5 px-2 py-0.5">
                      <Text className="text-[10px] font-bold text-white/60">4 sub-questions (10 marks)</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-xs font-bold text-mint">View Solution</Text>
                    <Ionicons name="chevron-forward" size={14} color="#57E0B7" />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <MCQQuizModal
        visible={mcqModalVisible}
        questions={demoMCQs}
        subjectTitle="HSC Adaptive MCQ Practice"
        onClose={() => setMcqModalVisible(false)}
      />

      <CQViewerModal
        visible={!!selectedCQ}
        cq={selectedCQ}
        onClose={() => setSelectedCQ(null)}
      />
    </Screen>
  );
}
