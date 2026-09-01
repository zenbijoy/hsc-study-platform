import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import type { Formula } from '@/data/demo';
import { useStudyStore } from '@/store/studyStore';

interface FormulaDetailModalProps {
  visible: boolean;
  formula: Formula | null;
  onClose: () => void;
}

export function FormulaDetailModal({
  visible,
  formula,
  onClose,
}: FormulaDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const toggleFavorite = useStudyStore((state) => state.toggleFavoriteFormula);
  const isFavorite = useStudyStore((state) =>
    formula ? state.isFormulaFavorite(formula.id) : false
  );

  if (!formula) return null;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/80">
        <View className="max-h-[85%] rounded-t-[36px] border-t border-white/10 bg-[#0B151E] p-6 pb-10">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-white/10 pb-4">
            <View className="flex-1 pr-4">
              <View className="flex-row items-center gap-2">
                <View className="rounded-full bg-sky/15 px-2.5 py-0.5">
                  <Text className="text-[10px] font-bold uppercase text-sky">
                    {formula.chapter}
                  </Text>
                </View>
                <View className="flex-row items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={12}
                      color={i < formula.importance ? '#FBBF24' : '#2A3644'}
                    />
                  ))}
                </View>
              </View>
              <Text className="mt-1.5 text-xl font-black text-white" numberOfLines={1}>
                {formula.title}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => toggleFavorite(formula.id)}
                className="h-9 w-9 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isFavorite ? '#F43F5E' : 'white'}
                />
              </Pressable>
              <Pressable
                onPress={onClose}
                className="h-9 w-9 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
              >
                <Ionicons name="close" size={20} color="white" />
              </Pressable>
            </View>
          </View>

          {/* Equation Box */}
          <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
            <View className="rounded-3xl border border-mint/20 bg-gradient-to-br from-mint/10 to-transparent p-6 items-center">
              <Text className="text-xs font-bold uppercase tracking-[2px] text-mint">
                Equation
              </Text>
              <Text className="mt-3 text-3xl font-black tracking-wide text-white text-center">
                {formula.plain}
              </Text>
              <Text className="mt-2 text-xs text-white/40 font-mono">
                LaTeX: {formula.latex}
              </Text>

              <Pressable
                onPress={handleCopy}
                className="mt-5 flex-row items-center gap-2 rounded-xl bg-white/10 px-4 py-2 active:bg-white/20"
              >
                <Ionicons
                  name={copied ? 'checkmark-circle' : 'copy-outline'}
                  size={16}
                  color={copied ? '#57E0B7' : 'white'}
                />
                <Text className="text-xs font-bold text-white">
                  {copied ? 'Copied LaTeX!' : 'Copy Formula'}
                </Text>
              </Pressable>
            </View>

            {/* Explanation */}
            {formula.explanation && (
              <View className="mt-5 rounded-2xl border border-white/8 bg-panel p-4">
                <Text className="text-xs font-bold uppercase tracking-[1px] text-white/50">
                  Concept & Physical Interpretation
                </Text>
                <Text className="mt-2 text-sm leading-6 text-white/85">
                  {formula.explanation}
                </Text>
              </View>
            )}

            {/* Variables and SI Units */}
            {formula.variables && formula.variables.length > 0 && (
              <View className="mt-5 rounded-2xl border border-white/8 bg-panel p-4">
                <Text className="text-xs font-bold uppercase tracking-[1px] text-white/50 mb-3">
                  Variables & SI Units
                </Text>
                <View className="gap-2.5">
                  {formula.variables.map((v) => (
                    <View
                      key={v.symbol}
                      className="flex-row items-center justify-between border-b border-white/5 pb-2.5"
                    >
                      <View className="flex-row items-center gap-2.5">
                        <View className="h-7 w-7 items-center justify-center rounded-lg bg-sky/15">
                          <Text className="font-bold text-xs text-sky">{v.symbol}</Text>
                        </View>
                        <Text className="text-xs font-semibold text-white/90">{v.name}</Text>
                      </View>
                      <Text className="text-xs font-mono text-mint/80">{v.unit}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
