import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import type { CQQuestion } from '@/data/demo';

interface CQViewerModalProps {
  visible: boolean;
  cq: CQQuestion | null;
  onClose: () => void;
}

export function CQViewerModal({ visible, cq, onClose }: CQViewerModalProps) {
  const [expandedIndices, setExpandedIndices] = useState<number[]>([0]);

  if (!cq) return null;

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/80">
        <View className="max-h-[92%] rounded-t-[36px] border-t border-white/10 bg-[#0B151E] p-6 pb-10">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-white/10 pb-4">
            <View className="flex-1 pr-4">
              <View className="flex-row items-center gap-2">
                <View className="rounded-full bg-mint/15 px-2.5 py-0.5">
                  <Text className="text-[10px] font-bold uppercase text-mint">{cq.chapter}</Text>
                </View>
                {cq.board && (
                  <Text className="text-xs text-white/40">
                    {cq.board} · {cq.year}
                  </Text>
                )}
              </View>
              <Text className="mt-1 text-xl font-black text-white" numberOfLines={1}>
                {cq.title}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
            >
              <Ionicons name="close" size={20} color="white" />
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Stimulus / উদ্দীপক */}
            <View className="rounded-2xl border border-sky/20 bg-sky/5 p-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="document-text-outline" size={16} color="#6CB7FF" />
                <Text className="text-xs font-bold uppercase tracking-[1px] text-sky">
                  Stimulus · উদ্দীপক
                </Text>
              </View>
              <Text className="mt-2 text-sm leading-6 text-white/90">{cq.stimulus}</Text>
            </View>

            {/* Sub Questions ক, খ, গ, ঘ */}
            <Text className="mt-6 text-sm font-bold uppercase tracking-[1px] text-white/40">
              Sub-Questions & Model Solutions
            </Text>

            <View className="mt-3 gap-3">
              {cq.subQuestions.map((sub, idx) => {
                const isExpanded = expandedIndices.includes(idx);
                return (
                  <View
                    key={sub.letter}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-panel"
                  >
                    <Pressable
                      onPress={() => toggleExpand(idx)}
                      className="flex-row items-center justify-between p-4 active:bg-white/5"
                    >
                      <View className="flex-row items-center flex-1 pr-3">
                        <View className="h-8 w-8 items-center justify-center rounded-xl bg-white/10 mr-3">
                          <Text className="font-bold text-mint">{sub.banglaLetter}</Text>
                        </View>
                        <Text className="text-sm font-bold text-white flex-1 leading-5">
                          {sub.question}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <View className="rounded-md bg-white/10 px-2 py-0.5">
                          <Text className="text-[11px] font-bold text-white/70">
                            {sub.marks} {sub.marks === 1 ? 'mark' : 'marks'}
                          </Text>
                        </View>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color="#6A7883"
                        />
                      </View>
                    </Pressable>

                    {isExpanded && (
                      <View className="border-t border-white/5 bg-black/25 p-4">
                        <Text className="text-xs font-bold uppercase tracking-[1px] text-mint">
                          Model Solution / Marking Rubric:
                        </Text>
                        <Text className="mt-2 text-xs leading-5 text-white/80 font-mono">
                          {sub.solution}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
