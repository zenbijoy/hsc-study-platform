import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '@/src/theme';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { AppText } from '@/src/components/ui/Typography';
import { Section, SectionHeader, Divider, Spacer } from '@/src/components/ui/Layout';
import { AppButton } from '@/src/components/common/AppButton';
import { IconButton } from '@/src/components/ui/IconButton';
import { Chip, Badge } from '@/src/components/ui/Chip';
import { FilterChipGroup } from '@/src/components/ui/FilterChipGroup';
import { LinearProgress, ReadingProgress } from '@/src/components/ui/Progress';
import { Skeleton, TextSkeleton, BookCardSkeleton } from '@/src/components/ui/Skeleton';
import { EmptyState, InlineError } from '@/src/components/ui/FeedbackStates';
import { SearchField } from '@/src/components/ui/SearchField';
import { BookCover } from '@/src/components/domain/BookCover';
import { BookCardGrid, ContinueReadingCard } from '@/src/components/domain/BookCardSystem';
import { SubjectCard } from '@/src/components/domain/SubjectCard';
import { ChapterCard } from '@/src/components/domain/ChapterCard';
import { FormulaCard } from '@/src/components/domain/FormulaCard';
import { CQCard, MCQCard, ContentCountCard } from '@/src/components/domain/QuestionCards';
import { ProcessingTimeline, ConfidenceBadge, SecureBadge } from '@/src/components/domain/PipelineCards';
import {
  bengaliBooksFixture,
  bengaliChaptersFixture,
  bengaliFormulasFixture,
  bengaliCQsFixture,
} from '@/src/fixtures/bengaliFixtures';

export default function DesignSystemGalleryScreen() {
  const theme = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('physics');
  const [searchQuery, setSearchQuery] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);
  const [mcqSelected, setMcqSelected] = useState<number | null>(null);

  const sampleSubjects = [
    { id: 'physics', label: 'Physics', count: 12, accentColor: '#6CB7FF' },
    { id: 'chemistry', label: 'Chemistry', count: 8, accentColor: '#57E0B7' },
    { id: 'math', label: 'Higher Math', count: 14, accentColor: '#A58BFF' },
    { id: 'biology', label: 'Biology', count: 9, accentColor: '#FF8A76' },
  ];

  return (
    <View className="flex-1 bg-[#071018]">
      <AppHeader title="Design System Gallery" subtitle="Phase 03 Production Tokens" showBack />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Typography */}
        <Section className="mt-4">
          <SectionHeader title="1. Typography Hierarchy" subtitle="English, Bangla & Math" />
          <View className="gap-2 p-4 bg-[#0D1822] rounded-2xl border border-white/10">
            <AppText variant="display" color="mint">
              Display 32px পদার্থবিজ্ঞান
            </AppText>
            <AppText variant="headlineLarge" color="primary">
              Headline Large 24px
            </AppText>
            <AppText variant="headlineMedium" color="sky">
              Headline Medium 20px
            </AppText>
            <AppText variant="titleLarge" color="primary">
              Title Large 18px • ভেক্টর ও ক্যালকুলাস
            </AppText>
            <AppText variant="bodyLarge" color="secondary">
              Body Large: HSC Study Platform provides secure, data-driven academic learning tools.
            </AppText>
            <AppText variant="caption" color="muted">
              Caption 11px • Version 2.0 Token System
            </AppText>
          </View>
        </Section>

        {/* 2. Buttons & Actions */}
        <Section>
          <SectionHeader title="2. Buttons & Icon Actions" />
          <View className="gap-3">
            <View className="flex-row gap-2.5">
              <AppButton
                onPress={() => {
                  setBtnLoading(true);
                  setTimeout(() => setBtnLoading(false), 2000);
                }}
                loading={btnLoading}
                className="flex-1"
              >
                Primary Button
              </AppButton>
              <AppButton onPress={() => {}} variant="secondary" className="flex-1">
                Secondary
              </AppButton>
            </View>

            <View className="flex-row gap-2.5">
              <AppButton onPress={() => {}} variant="outline" className="flex-1">
                Outline
              </AppButton>
              <AppButton onPress={() => {}} variant="danger" className="flex-1">
                Danger Action
              </AppButton>
            </View>

            <View className="flex-row items-center gap-3">
              <IconButton name="bookmark-outline" onPress={() => {}} accessibilityLabel="Bookmark" />
              <IconButton name="share-social-outline" onPress={() => {}} accessibilityLabel="Share" />
              <IconButton name="heart" variant="filled" onPress={() => {}} accessibilityLabel="Favorite" />
              <IconButton name="shield-checkmark" variant="tint" onPress={() => {}} accessibilityLabel="Security" />
            </View>
          </View>
        </Section>

        {/* 3. Search & Chips */}
        <Section>
          <SectionHeader title="3. Search & Filter System" />
          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Bengali textbooks..."
            onFilterPress={() => {}}
            hasActiveFilters
            className="mb-3"
          />
          <FilterChipGroup
            options={sampleSubjects}
            selectedId={selectedFilter}
            onSelect={setSelectedFilter}
          />
        </Section>

        {/* 4. Subject Cards */}
        <Section>
          <SectionHeader title="4. Controlled Subject Card" />
          <SubjectCard
            subject={{
              id: 'physics',
              name: 'Physics',
              banglaName: 'পদার্থবিজ্ঞান',
              icon: 'planet-outline',
              accent: '#6CB7FF',
              bookCount: 4,
              progress: 68,
            }}
          />
        </Section>

        {/* 5. Book Card System */}
        <Section>
          <SectionHeader title="5. Book Card Layouts" />
          {bengaliBooksFixture[0] && (
            <ContinueReadingCard book={bengaliBooksFixture[0]} onPress={() => {}} className="mb-3" />
          )}
          {bengaliBooksFixture[1] && (
            <BookCardGrid book={bengaliBooksFixture[1]} onPress={() => {}} />
          )}
        </Section>

        {/* 6. Chapter Card */}
        <Section>
          <SectionHeader title="6. Chapter Intelligence Card" />
          {bengaliChaptersFixture[0] && (
            <ChapterCard chapter={bengaliChaptersFixture[0]} onPress={() => {}} />
          )}
        </Section>

        {/* 7. Formula Card */}
        <Section>
          <SectionHeader title="7. Data-Driven Formula Card" />
          {bengaliFormulasFixture[0] && (
            <FormulaCard formula={bengaliFormulasFixture[0]} isFavorite onToggleFavorite={() => {}} />
          )}
        </Section>

        {/* 8. Creative Question (CQ) Card */}
        <Section>
          <SectionHeader title="8. Board Creative Question (CQ) Card" />
          {bengaliCQsFixture[0] && (
            <CQCard cq={bengaliCQsFixture[0]} onPress={() => {}} />
          )}
        </Section>

        {/* 9. Multiple Choice Question (MCQ) */}
        <Section>
          <SectionHeader title="9. Multiple Choice Question (MCQ)" />
          <MCQCard
            mcq={{
              id: 'mcq-1',
              subjectId: 'physics',
              chapter: 'ভেক্টর',
              question: 'দুটি সমমানের ভেক্টরের লব্ধির মান তাদের একটির মানের সমান হলে মধ্যবর্তী কোণ কত?',
              banglaQuestion: 'দুটি সমমানের ভেক্টরের লব্ধির মান তাদের একটির মানের সমান হলে মধ্যবর্তী কোণ কত?',
              options: ['60°', '90°', '120°', '180°'],
              correctIndex: 2,
              explanation: 'R² = P² + Q² + 2PQ cos α => P² = 2P²(1 + cos α) => cos α = -1/2 => α = 120°',
              difficulty: 'medium',
            }}
            selectedIndex={mcqSelected}
            onSelectOption={setMcqSelected}
            showExplanation={mcqSelected !== null}
          />
        </Section>

        {/* 10. Dashboard Stats & Badges */}
        <Section>
          <SectionHeader title="10. Dashboard Statistics & Badges" />
          <View className="flex-row gap-2.5 mb-3">
            <ContentCountCard count={142} label="Formulas" icon="calculator-outline" accentColor="#57E0B7" />
            <ContentCountCard count={84} label="Board CQs" icon="document-text-outline" accentColor="#6CB7FF" />
            <ContentCountCard count={316} label="MCQ Bank" icon="checkbox-outline" accentColor="#A58BFF" />
          </View>
          <View className="flex-row flex-wrap gap-2">
            <ConfidenceBadge confidence={0.92} />
            <SecureBadge type="protected" />
            <SecureBadge type="offline" />
          </View>
        </Section>

        {/* 11. Pipeline Timeline */}
        <Section>
          <SectionHeader title="11. Ingestion Pipeline Timeline" />
          <View className="p-4 bg-[#0D1822] rounded-2xl border border-white/10">
            <ProcessingTimeline
              stages={['Upload', 'Validate', 'Analyze Structure', 'Extract Formulas', 'HSCP Encrypt', 'Ready']}
              activeStageIndex={3}
            />
          </View>
        </Section>

        {/* 12. Skeletons & Shimmer */}
        <Section>
          <SectionHeader title="12. Shimmer Skeleton Primitives" />
          <BookCardSkeleton />
        </Section>

        {/* 13. Inline Error & Empty States */}
        <Section>
          <SectionHeader title="13. Feedback & Error States" />
          <InlineError message="Unable to synchronize latest chapter bookmark to cloud." onRetry={() => {}} className="mb-3" />
          <EmptyState
            icon="bookmark-outline"
            title="No Bookmarks Yet"
            description="Tap the bookmark icon on any textbook page to save your study spot."
            actionLabel="Browse Library"
            onAction={() => {}}
          />
        </Section>
      </ScrollView>
    </View>
  );
}
