import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { Card } from '@/src/components/ui/Card';
import type { ReaderChapterItem } from '../types/reader.types';

export function ReaderContextSheet({
  visible,
  onClose,
  chapter,
  currentPage,
}: {
  visible: boolean;
  onClose: () => void;
  chapter?: ReaderChapterItem | null;
  currentPage: number;
  onOpenNotes?: () => void;
}) {
  const theme = useTheme();
  const router = useRouter();

  // Synthetic contextual formulas for the chapter
  const relatedFormulas = [
    { id: 'f-1', title: 'গতির সমীকরণ', latex: 'v = u + at', page: chapter?.startPage ? chapter.startPage + 3 : 15 },
    { id: 'f-2', title: 'বল ও ভরবেগ', latex: 'F = ma = \\frac{dp}{dt}', page: chapter?.startPage ? chapter.startPage + 8 : 22 },
    { id: 'f-3', title: 'কাজ-শক্তি উপপাদ্য', latex: 'W = \\Delta K = \\frac{1}{2}mv^2 - \\frac{1}{2}mu^2', page: chapter?.startPage ? chapter.startPage + 14 : 35 },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} className="flex-1 justify-end">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.colors.surfaceElevated,
            borderTopLeftRadius: theme.radius.xxl,
            borderTopRightRadius: theme.radius.xxl,
            maxHeight: '80%',
            padding: 20,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-white/10 mb-4">
            <View>
              <AppText variant="titleLarge" color="primary" style={{ fontWeight: '800' }}>
                অধ্যায় সহায়ক স্টাডি টুলস
              </AppText>
              <AppText variant="caption" color="mint">
                {chapter ? chapter.banglaTitle || chapter.title : 'Current Chapter'} • পৃষ্ঠা {currentPage}
              </AppText>
            </View>
            <Ionicons name="close" size={22} color={theme.colors.textMuted} onPress={onClose} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="gap-3">
            {/* Related Formulas Section */}
            <AppText variant="labelMedium" color="primary" className="font-bold">
              সম্পর্কিত সূত্রাবলী (Linked Formulas)
            </AppText>
            {relatedFormulas.map((f) => (
              <Card
                key={f.id}
                variant="interactive"
                onPress={() => {
                  onClose();
                  router.push(`/formula/${f.id}` as any);
                }}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <AppText variant="titleMedium" color="primary" style={{ fontWeight: '700' }}>
                      {f.title}
                    </AppText>
                    <AppText variant="bodySmall" color="mint" className="font-mono mt-0.5">
                      {f.latex}
                    </AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                </View>
              </Card>
            ))}

            {/* Related Board CQ Practice Shortcut */}
            <AppText variant="labelMedium" color="primary" className="font-bold mt-2">
              সৃজনশীল বোর্ড প্রশ্ন (CQ Practice)
            </AppText>
            <Card
              variant="interactive"
              onPress={() => {
                onClose();
                router.push('/(tabs)/study' as any);
              }}
              style={{
                backgroundColor: 'rgba(108, 183, 255, 0.08)',
                borderColor: 'rgba(108, 183, 255, 0.3)',
                borderWidth: 1,
                padding: 14,
                marginBottom: 8,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="school-outline" size={24} color="#6CB7FF" />
                  <View>
                    <AppText variant="titleMedium" color="primary" style={{ fontWeight: '700' }}>
                      এই অধ্যায়ের সকল বোর্ড CQ অনুশীলন
                    </AppText>
                    <AppText variant="caption" color="muted">
                      ঢাকা, চট্টগ্রাম, রাজশাহীসহ সকল বোর্ডের বিগত ৫ বছরের প্রশ্ন
                    </AppText>
                  </View>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#6CB7FF" />
              </View>
            </Card>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
