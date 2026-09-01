import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { File } from 'expo-file-system';
import { useTheme } from '@/src/theme';
import { fetchReaderBookData, getFallbackReaderChapters } from '../data/reader.repository';
import { findCurrentChapter } from '../utils/chapterLookup';
import { getReaderThemePalette } from '../utils/readerTheme';
import { resolveReaderLaunch } from '../security/readerLaunchResolver';
import { ProtectedReaderSession } from '../security/protectedReaderSession';
import { useReaderProgress } from '../hooks/useReaderProgress';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { useReaderBookmarks } from '../hooks/useReaderBookmarks';
import { useReaderNotes } from '../hooks/useReaderNotes';
import { useReaderController } from '../hooks/useReaderController';
import { useReaderLifecycle } from '../hooks/useReaderLifecycle';
import { ReaderTopBar } from '../components/ReaderTopBar';
import { ReaderBottomBar } from '../components/ReaderBottomBar';
import { ReaderPageView } from '../components/ReaderPageView';
import { ReaderWatermark } from '../components/ReaderWatermark';
import { ReaderSkeleton } from '../components/ReaderSkeleton';
import { ReaderErrorState } from '../components/ReaderErrorState';
import { ReaderChapterSheet } from '../components/ReaderChapterSheet';
import { ReaderThumbnailSheet } from '../components/ReaderThumbnailSheet';
import { ReaderSearchSheet } from '../components/ReaderSearchSheet';
import { ReaderBookmarksSheet } from '../components/ReaderBookmarksSheet';
import { ReaderNotesSheet } from '../components/ReaderNotesSheet';
import { ReaderAppearanceSheet } from '../components/ReaderAppearanceSheet';
import { ReaderMoreSheet } from '../components/ReaderMoreSheet';
import { ReaderPageJumpSheet } from '../components/ReaderPageJumpSheet';
import { ReaderContextSheet } from '../components/ReaderContextSheet';
import type { Chapter } from '@/src/types/book.types';

export function SecurePdfViewerScreen({
  bookId,
  versionId,
  initialPage = 1,
}: {
  bookId: string;
  versionId?: string;
  initialPage?: number;
}) {
  const router = useRouter();
  const theme = useTheme();

  // 1. Settings & Progress Hooks
  const {
    settings,
    setDisplayMode,
    setPageDirection,
    setBrightness,
    setKeepScreenAwake,
  } = useReaderSettings();

  const {
    currentPage,
    totalPages,
    updatePage,
    setTotalPages,
  } = useReaderProgress(bookId, initialPage, 500);

  const {
    bookmarks,
    isPageBookmarked,
    toggleBookmark,
    removeBookmark,
  } = useReaderBookmarks(bookId, versionId);

  const {
    notes,
    hasNoteOnPage,
    addOrUpdateNote,
    removeNote,
  } = useReaderNotes(bookId, versionId);

  // 2. Fetch Book metadata & Chapters
  const { data: bookDetails } = useQuery({
    queryKey: ['reader_book', bookId],
    queryFn: () => fetchReaderBookData(bookId),
    enabled: Boolean(bookId),
  });

  const book = bookDetails?.book || null;
  const chapters: Chapter[] = useMemo(() => {
    if (bookDetails?.chapters && bookDetails.chapters.length > 0) {
      return bookDetails.chapters.map((ch) => ({
        id: ch.id,
        bookId,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        banglaTitle: ch.banglaTitle || ch.title,
        startPage: ch.startPage,
        endPage: ch.endPage,
        formulaCount: ch.formulaCount,
        cqCount: ch.cqCount,
        mcqCount: ch.mcqCount,
      }));
    }
    return getFallbackReaderChapters(bookId);
  }, [bookDetails, bookId]);

  const currentChapter = useMemo(() => {
    return findCurrentChapter(chapters, currentPage) || chapters[0];
  }, [chapters, currentPage]);

  const palette = useMemo(() => getReaderThemePalette(settings.displayMode), [settings.displayMode]);

  // 3. Sheet Visibilities
  const [isChapterSheetOpen, setIsChapterSheetOpen] = useState(false);
  const [isThumbnailSheetOpen, setIsThumbnailSheetOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [isBookmarksSheetOpen, setIsBookmarksSheetOpen] = useState(false);
  const [isNotesSheetOpen, setIsNotesSheetOpen] = useState(false);
  const [isAppearanceSheetOpen, setIsAppearanceSheetOpen] = useState(false);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [isPageJumpSheetOpen, setIsPageJumpSheetOpen] = useState(false);
  const [isContextSheetOpen, setIsContextSheetOpen] = useState(false);

  // 4. Session & Encryption State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const sessionId = useMemo(() => `S:${Math.random().toString(16).slice(2, 8).toUpperCase()}`, []);

  // Initialize protected reader session
  useEffect(() => {
    let active = true;
    const session = new ProtectedReaderSession(`reader-${bookId}`);

    (async () => {
      setIsLoadingSession(true);
      setSessionError(null);

      const resolution = await resolveReaderLaunch({ bookId, versionId, requestedPage: initialPage });
      if (resolution.mode === 'blocked') {
        if (active) {
          setSessionError(resolution.message);
          setIsLoadingSession(false);
        }
        return;
      }

      const result = await session.initialize(resolution);
      if (!active) {
        session.destroy();
        return;
      }

      if (result.error) {
        setSessionError(result.error);
      } else {
        setPdfFile(result.file);
      }
      setIsLoadingSession(false);
    })();

    return () => {
      active = false;
      session.destroy();
    };
  }, [bookId, versionId, initialPage]);

  // 5. Controller Hook
  const { controller, controlsVisible, fullscreen } = useReaderController({
    currentPage,
    totalPages,
    onPageChange: updatePage,
    onDisplayModeChange: setDisplayMode,
    onPageDirectionChange: setPageDirection,
    onBrightnessChange: setBrightness,
    onKeepScreenAwakeChange: setKeepScreenAwake,
    onClose: async () => {
      router.back();
    },
  });

  // 6. Lifecycle handling
  const closeAnyOpenSheet = useCallback(() => {
    if (isChapterSheetOpen) { setIsChapterSheetOpen(false); return true; }
    if (isThumbnailSheetOpen) { setIsThumbnailSheetOpen(false); return true; }
    if (isSearchSheetOpen) { setIsSearchSheetOpen(false); return true; }
    if (isBookmarksSheetOpen) { setIsBookmarksSheetOpen(false); return true; }
    if (isNotesSheetOpen) { setIsNotesSheetOpen(false); return true; }
    if (isAppearanceSheetOpen) { setIsAppearanceSheetOpen(false); return true; }
    if (isMoreSheetOpen) { setIsMoreSheetOpen(false); return true; }
    if (isPageJumpSheetOpen) { setIsPageJumpSheetOpen(false); return true; }
    if (isContextSheetOpen) { setIsContextSheetOpen(false); return true; }
    return false;
  }, [
    isChapterSheetOpen,
    isThumbnailSheetOpen,
    isSearchSheetOpen,
    isBookmarksSheetOpen,
    isNotesSheetOpen,
    isAppearanceSheetOpen,
    isMoreSheetOpen,
    isPageJumpSheetOpen,
    isContextSheetOpen,
  ]);

  useReaderLifecycle({
    onBackground: () => {},
    onBackPressed: () => {
      if (closeAnyOpenSheet()) return true;
      router.back();
      return true;
    },
  });

  if (sessionError) {
    return (
      <ReaderErrorState
        message={sessionError}
        onBack={() => router.back()}
        onRetry={() => {
          setIsLoadingSession(true);
          setSessionError(null);
        }}
      />
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <StatusBar
        hidden={fullscreen}
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Top Bar */}
      {controlsVisible && !fullscreen && (
        <ReaderTopBar
          title={book?.title || 'HSC Textbook'}
          chapterTitle={currentChapter?.banglaTitle || currentChapter?.title}
          isBookmarked={isPageBookmarked(currentPage)}
          palette={palette}
          canGoBackLocation={controller.canGoBackLocation}
          onBack={() => router.back()}
          onGoBackLocation={controller.goBackLocation}
          onToggleBookmark={() => toggleBookmark(currentPage, currentChapter?.title, currentChapter?.id)}
          onOpenSearch={() => setIsSearchSheetOpen(true)}
          onOpenContextTools={() => setIsContextSheetOpen(true)}
          onOpenMore={() => setIsMoreSheetOpen(true)}
        />
      )}

      {/* Main Canvas / PDF View */}
      <View style={styles.canvasContainer}>
        {pdfFile ? (
          <ReaderPageView
            uri={pdfFile.uri}
            currentPage={currentPage}
            settings={settings}
            palette={palette}
            onPageChanged={(p) => updatePage(p)}
            onLoadComplete={(count) => setTotalPages(count)}
            onTapCanvas={controller.toggleControls}
          />
        ) : (
          <ReaderSkeleton
            palette={palette}
            currentPage={currentPage}
            totalPages={totalPages}
            message={isLoadingSession ? 'Initializing secure reader sandbox…' : 'Secure preview active.'}
          />
        )}

        {/* Dynamic Watermark */}
        <ReaderWatermark
          sessionId={sessionId}
          pageNumber={currentPage}
          displayMode={settings.displayMode}
        />
      </View>

      {/* Bottom Bar */}
      {controlsVisible && !fullscreen && (
        <ReaderBottomBar
          currentPage={currentPage}
          totalPages={totalPages}
          palette={palette}
          onPreviousPage={controller.previousPage}
          onNextPage={controller.nextPage}
          onOpenPageJump={() => setIsPageJumpSheetOpen(true)}
          onOpenChapters={() => setIsChapterSheetOpen(true)}
          onOpenThumbnails={() => setIsThumbnailSheetOpen(true)}
          onOpenBookmarks={() => setIsBookmarksSheetOpen(true)}
          onOpenAppearance={() => setIsAppearanceSheetOpen(true)}
          onScrubRelease={(p) => controller.goToPage(p, true, 'jump')}
        />
      )}

      {/* Modals & Sheets */}
      <ReaderChapterSheet
        visible={isChapterSheetOpen}
        onClose={() => setIsChapterSheetOpen(false)}
        chapters={chapters}
        currentPage={currentPage}
        onSelectChapter={controller.jumpToChapter}
      />

      <ReaderThumbnailSheet
        visible={isThumbnailSheetOpen}
        onClose={() => setIsThumbnailSheetOpen(false)}
        totalPages={totalPages}
        currentPage={currentPage}
        bookmarks={bookmarks}
        onSelectPage={(p) => controller.goToPage(p, true, 'jump')}
      />

      <ReaderSearchSheet
        visible={isSearchSheetOpen}
        onClose={() => setIsSearchSheetOpen(false)}
        chapters={chapters}
        onJumpToPage={(p) => controller.goToPage(p, true, 'search')}
      />

      <ReaderBookmarksSheet
        visible={isBookmarksSheetOpen}
        onClose={() => setIsBookmarksSheetOpen(false)}
        bookmarks={bookmarks}
        currentPage={currentPage}
        onSelectBookmark={(bm) => controller.goToPage(bm.pageNumber, true, 'bookmark')}
        onRemoveBookmark={removeBookmark}
      />

      <ReaderNotesSheet
        visible={isNotesSheetOpen}
        onClose={() => setIsNotesSheetOpen(false)}
        notes={notes}
        currentPage={currentPage}
        chapterTitle={currentChapter?.title}
        onSaveNote={(p, text, nId) => addOrUpdateNote(p, text, nId, currentChapter?.title, currentChapter?.id)}
        onDeleteNote={removeNote}
        onJumpToNote={(p) => controller.goToPage(p, true, 'jump')}
      />

      <ReaderAppearanceSheet
        visible={isAppearanceSheetOpen}
        onClose={() => setIsAppearanceSheetOpen(false)}
        settings={settings}
        onChangeDisplayMode={setDisplayMode}
        onChangePageDirection={setPageDirection}
        onChangeBrightness={setBrightness}
        onToggleKeepScreenAwake={setKeepScreenAwake}
      />

      <ReaderMoreSheet
        visible={isMoreSheetOpen}
        onClose={() => setIsMoreSheetOpen(false)}
        bookTitle={book?.title || 'HSC Textbook'}
        currentPage={currentPage}
        totalPages={totalPages}
        chapterTitle={currentChapter?.title}
        versionId={versionId}
        isOffline={Boolean(pdfFile)}
        onOpenBookmarks={() => setIsBookmarksSheetOpen(true)}
        onOpenNotes={() => setIsNotesSheetOpen(true)}
        onOpenAppearance={() => setIsAppearanceSheetOpen(true)}
        onOpenPageJump={() => setIsPageJumpSheetOpen(true)}
      />

      <ReaderPageJumpSheet
        visible={isPageJumpSheetOpen}
        onClose={() => setIsPageJumpSheetOpen(false)}
        currentPage={currentPage}
        totalPages={totalPages}
        onJumpToPage={(p) => controller.goToPage(p, true, 'jump')}
      />

      <ReaderContextSheet
        visible={isContextSheetOpen}
        onClose={() => setIsContextSheetOpen(false)}
        chapter={currentChapter}
        currentPage={currentPage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
});
