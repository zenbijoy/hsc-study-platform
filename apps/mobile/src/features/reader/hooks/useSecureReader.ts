import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { File } from 'expo-file-system';
import { useQuery } from '@tanstack/react-query';
import { getBookById } from '@/src/repositories/books.repository';
import { fetchBookDetailsData } from '@/src/features/books/data/bookDetails.repository';
import { bengaliChaptersFixture } from '@/src/fixtures/bengaliFixtures';
import { getDownloadedPackage } from '@/lib/download';
import { getCachedContentKey } from '@/lib/license';
import { saveReadingProgress } from '@/lib/progress';
import { useStudyStore } from '@/store/studyStore';
import { enableScreenCaptureProtection, disableScreenCaptureProtection } from '../security/screenCapture';
import { createProtectedReaderFile, cleanupProtectedReaderFile } from '../security/plaintextLifecycle';
import { getReaderThemePalette } from '../utils/readerTheme';
import { ReaderDisplayMode, ReaderPageDirection, ReaderSessionState } from '../types/reader.types';
import type { Chapter } from '@/src/types/book.types';

export function useSecureReader(bookId: string, versionId?: string, initialPage: number = 1) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(540);
  const [displayMode, setDisplayMode] = useState<ReaderDisplayMode>('dark');
  const [pageDirection, setPageDirection] = useState<ReaderPageDirection>('vertical');
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const tempRef = useRef<File | null>(null);
  const [sessionMessage, setSessionMessage] = useState('Initializing secure reader sandbox…');

  const sessionId = useMemo(() => `S:${Math.random().toString(16).slice(2, 8).toUpperCase()}`, []);

  // Fetch Book metadata & dynamic chapter map
  const { data: bookDetails } = useQuery({
    queryKey: ['book_details', bookId],
    queryFn: () => fetchBookDetailsData(bookId),
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
    return bengaliChaptersFixture as Chapter[];
  }, [bookDetails, bookId]);

  const currentChapter = useMemo(() => {
    return chapters.find((ch) => currentPage >= ch.startPage && (ch.endPage ? currentPage <= ch.endPage : true)) || chapters[0];
  }, [chapters, currentPage]);

  const palette = useMemo(() => getReaderThemePalette(displayMode), [displayMode]);

  // Bookmarks store
  const addBookmark = useStudyStore((state: any) => state.addBookmark);
  const bookBookmarks = useStudyStore((state: any) => state.getBookBookmarks(bookId));
  const isBookmarked = useMemo(() => {
    return (bookBookmarks || []).some((b: any) => b.page === currentPage);
  }, [bookBookmarks, currentPage]);

  // 1. Screen Capture Protection
  useEffect(() => {
    enableScreenCaptureProtection(`reader-${bookId}`);
    return () => {
      disableScreenCaptureProtection(`reader-${bookId}`);
    };
  }, [bookId]);

  // 2. App State: Auto-purge plaintext decrypted cache on background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && tempRef.current) {
        cleanupProtectedReaderFile(tempRef.current);
        tempRef.current = null;
        setPdfFile(null);
        setSessionMessage('Protected sandbox cache purged upon leaving foreground.');
      }
    });
    return () => sub.remove();
  }, []);

  // 3. Materialize & Decrypt Package
  useEffect(() => {
    let active = true;
    (async () => {
      if (!versionId) {
        setSessionMessage('Protected sandbox session active (Simulated Reader Mode).');
        return;
      }

      const encrypted = getDownloadedPackage(versionId);
      const contentKey = await getCachedContentKey(versionId);

      if (!encrypted || !contentKey) {
        setSessionMessage('Offline package not yet downloaded. Tap Offline Download in Book Details.');
        return;
      }

      setSessionMessage('Decrypting AES-256-GCM chunks into secure sandbox cache…');
      try {
        const file = await createProtectedReaderFile(encrypted.uri, contentKey);
        if (!active) {
          cleanupProtectedReaderFile(file);
          return;
        }
        tempRef.current = file;
        setPdfFile(file);
        setSessionMessage('');
      } catch (err: any) {
        setSessionMessage(err?.message || 'Unable to open protected package');
      }
    })();

    return () => {
      active = false;
      cleanupProtectedReaderFile(tempRef.current);
      tempRef.current = null;
    };
  }, [versionId]);

  // Handle Page Changes
  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(clamped);
      saveReadingProgress(bookId, clamped, totalPages).catch(() => {});
    },
    [bookId, totalPages]
  );

  const nextPage = useCallback(() => goToPage(currentPage + 1), [goToPage, currentPage]);
  const previousPage = useCallback(() => goToPage(currentPage - 1), [goToPage, currentPage]);

  const toggleBookmark = useCallback(() => {
    if (!isBookmarked) {
      addBookmark({
        bookId,
        page: currentPage,
        chapterTitle: currentChapter?.title || `Page ${currentPage}`,
        note: 'Bookmark saved during study session',
      });
    }
  }, [isBookmarked, addBookmark, bookId, currentPage, currentChapter]);

  const sessionState: ReaderSessionState = {
    sessionId,
    bookId,
    versionId: versionId || '',
    mode: pdfFile ? 'offline' : 'demo',
    currentPage,
    totalPages,
    currentChapterTitle: currentChapter?.title || 'Chapter 1',
    isBookmarked,
    isLoading: !pdfFile && Boolean(versionId),
    message: sessionMessage,
    error: null,
  };

  return {
    book,
    chapters,
    sessionState,
    palette,
    displayMode,
    setDisplayMode,
    pageDirection,
    setPageDirection,
    pdfFile,
    goToPage,
    nextPage,
    previousPage,
    toggleBookmark,
    isChapterDrawerOpen,
    setIsChapterDrawerOpen,
    isSearchSheetOpen,
    setIsSearchSheetOpen,
    isSettingsSheetOpen,
    setIsSettingsSheetOpen,
    setTotalPages,
  };
}
