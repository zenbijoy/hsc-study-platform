import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { resolveSubjectTheme } from '@/src/theme/subjects';
import type { Book } from '@/src/types/book.types';
import { Card } from '../ui/Card';
import { AppText } from '../ui/Typography';
import { LinearProgress } from '../ui/Progress';
import { BookCover } from './BookCover';
import { AppButton } from '../common/AppButton';

export function BookCardGrid({
  book,
  onPress,
  className = '',
}: {
  book: Book;
  onPress: () => void;
  className?: string;
}) {
  const theme = useTheme();
  const subTheme = resolveSubjectTheme(book.subjectId);

  return (
    <Card
      variant="interactive"
      onPress={onPress}
      accessibilityLabel={`Open ${book.title}`}
      className={`p-3.5 mb-3 ${className}`}
    >
      <View className="flex-row gap-3.5">
        <BookCover
          title={book.title}
          subjectId={book.subjectId}
          isProtected={book.protected}
          width={84}
        />

        <View className="flex-1 justify-between py-0.5">
          <View>
            <View className="flex-row items-center justify-between mb-1">
              <View
                style={{
                  backgroundColor: subTheme.tintBg,
                  borderRadius: theme.radius.sm,
                  paddingHorizontal: 6,
                  paddingVertical: 1.5,
                }}
              >
                <AppText
                  variant="caption"
                  style={{ color: subTheme.primary, fontWeight: '700', fontSize: 10 }}
                >
                  {subTheme.nameBn}
                </AppText>
              </View>
              <AppText variant="caption" color="muted">
                {book.publisher}
              </AppText>
            </View>

            <AppText variant="titleMedium" color="primary" numberOfLines={2}>
              {book.title}
            </AppText>
            {book.subtitle && (
              <AppText variant="caption" color="muted" numberOfLines={1} className="mt-0.5">
                {book.subtitle}
              </AppText>
            )}
          </View>

          <View>
            <View className="flex-row items-center gap-3 mb-2">
              <AppText variant="caption" color="muted">
                {book.chapters} Chapters
              </AppText>
              <AppText variant="caption" color="muted">•</AppText>
              <AppText variant="caption" color="muted">
                {book.formulas} Formulas
              </AppText>
            </View>
            <LinearProgress percentage={book.progress || 0} height={4} color={subTheme.primary} />
          </View>
        </View>
      </View>
    </Card>
  );
}

export function ContinueReadingCard({
  book,
  onPress,
  className = '',
}: {
  book: Book;
  onPress: () => void;
  className?: string;
}) {
  const theme = useTheme();
  const subTheme = resolveSubjectTheme(book.subjectId);
  const percentage = book.pages > 0 ? Math.round((book.lastPage / book.pages) * 100) : 0;

  return (
    <Card
      variant="interactive"
      onPress={onPress}
      className={`p-4 ${className}`}
      style={{
        backgroundColor: theme.colors.surfaceElevated,
        borderColor: subTheme.primary,
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
          <AppText variant="labelMedium" color="mint">
            Continue Reading
          </AppText>
        </View>
        <AppText variant="caption" color="muted">
          Page {book.lastPage} of {book.pages} ({percentage}%)
        </AppText>
      </View>

      <View className="flex-row gap-3.5 items-center">
        <BookCover
          title={book.title}
          subjectId={book.subjectId}
          isProtected={book.protected}
          width={56}
          aspectRatio={0.7}
        />
        <View className="flex-1">
          <AppText variant="titleMedium" color="primary" numberOfLines={1}>
            {book.title}
          </AppText>
          <AppText variant="bodySmall" color="muted" numberOfLines={1} className="mt-0.5 mb-2">
            {subTheme.nameBn} • {book.publisher}
          </AppText>
          <LinearProgress percentage={percentage} height={4} color={subTheme.primary} />
        </View>
      </View>
    </Card>
  );
}
