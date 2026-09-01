import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import type { Chapter } from '@/data/demo';

interface ChapterListModalProps {
  visible: boolean;
  chapters: Chapter[];
  bookTitle: string;
  onClose: () => void;
  onSelectChapter: (chapter: Chapter) => void;
}

export function ChapterListModal({
  visible,
  chapters,
  bookTitle,
  onClose,
  onSelectChapter,
}: ChapterListModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/75">
        <View className="max-h-[82%] rounded-t-[36px] border-t border-white/10 bg-[#0B151E] p-6 pb-10">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-white/10 pb-4">
            <View className="flex-1 pr-4">
              <Text className="text-xs font-bold uppercase tracking-[2px] text-mint">
                Chapter Index
              </Text>
              <Text className="mt-1 text-xl font-black text-white" numberOfLines={1}>
                {bookTitle}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
            >
              <Ionicons name="close" size={20} color="white" />
            </Pressable>
          </View>

          {/* Chapters List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {chapters.length === 0 ? (
              <View className="py-12 items-center">
                <Ionicons name="book-outline" size={40} color="#6A7883" />
                <Text className="mt-3 text-sm text-white/50">No chapters mapped yet</Text>
              </View>
            ) : (
              chapters.map((chapter) => (
                <Pressable
                  key={chapter.id}
                  onPress={() => {
                    onSelectChapter(chapter);
                    onClose();
                  }}
                  className="mb-3 flex-row items-center rounded-2xl border border-white/8 bg-panel p-4 active:bg-white/10"
                >
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-sky/15">
                    <Text className="font-black text-sky">
                      {String(chapter.chapterNumber).padStart(2, '0')}
                    </Text>
                  </View>
                  <View className="ml-3.5 flex-1 pr-2">
                    <Text className="text-sm font-bold text-white" numberOfLines={1}>
                      {chapter.title}
                    </Text>
                    <Text className="mt-0.5 text-xs text-mint/80">{chapter.banglaTitle}</Text>
                    <View className="mt-2 flex-row items-center gap-2">
                      <View className="rounded-md bg-white/5 px-2 py-0.5">
                        <Text className="text-[10px] font-semibold text-white/60">
                          pp. {chapter.startPage}–{chapter.endPage}
                        </Text>
                      </View>
                      <View className="rounded-md bg-white/5 px-2 py-0.5">
                        <Text className="text-[10px] font-semibold text-white/60">
                          {chapter.formulaCount} formulas
                        </Text>
                      </View>
                      <View className="rounded-md bg-white/5 px-2 py-0.5">
                        <Text className="text-[10px] font-semibold text-white/60">
                          {chapter.cqCount} CQs
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#6A7883" />
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
