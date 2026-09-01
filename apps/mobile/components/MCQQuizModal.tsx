import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import type { MCQQuestion } from '@/data/demo';
import { useStudyStore } from '@/store/studyStore';

interface MCQQuizModalProps {
  visible: boolean;
  questions: MCQQuestion[];
  subjectTitle: string;
  onClose: () => void;
}

export function MCQQuizModal({
  visible,
  questions,
  subjectTitle,
  onClose,
}: MCQQuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const recordQuizAttempt = useStudyStore((state) => state.recordQuizAttempt);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setIsFinished(false);
      setShowExplanation(false);
    }
  }, [visible]);

  const currentQ = questions[currentIndex] ?? questions[0];

  if (!currentQ || questions.length === 0) return null;

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    const isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
      recordQuizAttempt({
        subjectId: currentQ.subjectId || 'physics',
        chapter: currentQ.chapter,
        score,
        totalQuestions: questions.length,
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setShowExplanation(false);
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/80">
        <View className="max-h-[92%] rounded-t-[36px] border-t border-white/10 bg-[#0B151E] p-6 pb-10">
          {/* Top Bar */}
          <View className="flex-row items-center justify-between border-b border-white/10 pb-4">
            <View>
              <Text className="text-xs font-bold uppercase tracking-[2px] text-mint">
                {subjectTitle} · Practice Lab
              </Text>
              <Text className="text-base font-black text-white">
                {isFinished ? 'Quiz Results' : `Question ${currentIndex + 1} of ${questions.length}`}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
            >
              <Ionicons name="close" size={20} color="white" />
            </Pressable>
          </View>

          {isFinished ? (
            /* Results Screen */
            <View className="py-8 items-center">
              <LinearGradient
                colors={['#57E0B733', '#0D1822']}
                className="w-full items-center rounded-[32px] border border-mint/20 p-8"
              >
                <View className="h-20 w-20 items-center justify-center rounded-full bg-mint/20">
                  <Ionicons name="trophy" size={40} color="#57E0B7" />
                </View>
                <Text className="mt-4 text-3xl font-black text-white">
                  {score} / {questions.length}
                </Text>
                <Text className="mt-1 text-sm font-semibold text-mint">
                  {Math.round((score / questions.length) * 100)}% Accuracy Score
                </Text>
                <Text className="mt-3 text-center text-xs text-white/50">
                  Your attempt has been recorded in your local study analytics.
                </Text>

                <View className="mt-6 w-full flex-row gap-3">
                  <Pressable
                    onPress={handleRestart}
                    className="flex-1 items-center rounded-2xl bg-white/10 py-3.5"
                  >
                    <Text className="font-bold text-white">Retry Quiz</Text>
                  </Pressable>
                  <Pressable
                    onPress={onClose}
                    className="flex-1 items-center rounded-2xl bg-mint py-3.5"
                  >
                    <Text className="font-bold text-ink">Done</Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          ) : (
            /* Question & Options */
            <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
              {/* Progress Bar */}
              <View className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <View
                  className="h-full rounded-full bg-mint"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </View>

              {/* Tag / Board Info */}
              <View className="mt-4 flex-row items-center justify-between">
                <View className="rounded-full bg-sky/15 px-3 py-1">
                  <Text className="text-xs font-semibold text-sky">{currentQ.chapter}</Text>
                </View>
                {currentQ.board && (
                  <Text className="text-xs text-white/40">
                    {currentQ.board} · {currentQ.year}
                  </Text>
                )}
              </View>

              {/* Question Text */}
              <Text className="mt-4 text-lg font-bold leading-7 text-white">
                {currentQ.question}
              </Text>
              {currentQ.banglaQuestion && (
                <Text className="mt-2 text-sm leading-6 text-white/70">
                  {currentQ.banglaQuestion}
                </Text>
              )}

              {/* Options */}
              <View className="mt-6 gap-3">
                {currentQ.options.map((option, idx) => {
                  let borderColor = 'border-white/10';
                  let bgColor = 'bg-panel';
                  let textColor = 'text-white';
                  let icon = null;

                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      borderColor = 'border-mint';
                      bgColor = 'bg-mint/15';
                      textColor = 'text-mint';
                      icon = <Ionicons name="checkmark-circle" size={20} color="#57E0B7" />;
                    } else if (idx === selectedOption) {
                      borderColor = 'border-red-400';
                      bgColor = 'bg-red-400/15';
                      textColor = 'text-red-300';
                      icon = <Ionicons name="close-circle" size={20} color="#F87171" />;
                    }
                  }

                  return (
                    <Pressable
                      key={idx}
                      onPress={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`flex-row items-center justify-between rounded-2xl border p-4 active:bg-white/10 ${borderColor} ${bgColor}`}
                    >
                      <View className="flex-row items-center flex-1 pr-3">
                        <View className="h-8 w-8 items-center justify-center rounded-lg bg-white/5 mr-3">
                          <Text className="text-xs font-black text-white/70">
                            {optionLabels[idx]}
                          </Text>
                        </View>
                        <Text className={`text-sm font-semibold flex-1 ${textColor}`}>
                          {option}
                        </Text>
                      </View>
                      {icon}
                    </Pressable>
                  );
                })}
              </View>

              {/* Explanation Reveal */}
              {isAnswered && (
                <View className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <Pressable
                    onPress={() => setShowExplanation(!showExplanation)}
                    className="flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="bulb-outline" size={18} color="#6CB7FF" />
                      <Text className="text-xs font-bold uppercase tracking-[1px] text-sky">
                        Explanation & Derivation
                      </Text>
                    </View>
                    <Ionicons
                      name={showExplanation ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#6A7883"
                    />
                  </Pressable>

                  {showExplanation && (
                    <Text className="mt-3 text-xs leading-5 text-white/70">
                      {currentQ.explanation}
                    </Text>
                  )}
                </View>
              )}

              {/* Next Button */}
              {isAnswered && (
                <Pressable
                  onPress={handleNext}
                  className="mt-6 items-center rounded-2xl bg-mint py-4 active:bg-mint/80"
                >
                  <Text className="text-base font-black text-ink">
                    {currentIndex + 1 === questions.length ? 'Show Results' : 'Next Question'}
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
