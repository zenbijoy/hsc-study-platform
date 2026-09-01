import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/providers/AuthProvider';
import { fetchBookDetailsData } from '../data/bookDetails.repository';
import { resolveBookAccess } from '../utils/bookAccessResolver';
import { BookDetailsViewModel, DownloadStatus } from '../types/bookDetails.types';

export function useBookDetails(bookId: string) {
  const { isAuthenticated } = useAuth();
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloadSheetOpen, setIsDownloadSheetOpen] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['book', bookId, 'details'],
    queryFn: () => fetchBookDetailsData(bookId),
    enabled: Boolean(bookId),
    staleTime: 1000 * 60 * 15,
  });

  const book = data?.book || null;
  const activeVersion = data?.activeVersion || null;
  const chapters = data?.chapters || [];
  const formulasPreview = data?.formulas || [];

  const isDownloaded = downloadStatus === 'ready' || bookId === 'phys-1st';

  const access = useMemo(() => {
    return resolveBookAccess(book, activeVersion, isAuthenticated, true, isDownloaded);
  }, [book, activeVersion, isAuthenticated, isDownloaded]);

  const viewModel: BookDetailsViewModel | null = useMemo(() => {
    if (!book) return null;

    const progressPercentage = book.progress || 43;
    const currentPage = book.lastPage || 147;
    const totalPages = book.pages || 540;
    const currentChapter = chapters.find((c) => c.progress > 0 && c.progress < 100) || chapters[0];

    let totalFormulas = 0;
    let totalCQs = 0;
    let totalMCQs = 0;
    for (const ch of chapters) {
      totalFormulas += ch.formulaCount || 0;
      totalCQs += ch.cqCount || 0;
      totalMCQs += ch.mcqCount || 0;
    }

    return {
      book,
      activeVersion,
      access,
      progress: {
        progressPercentage,
        currentPage,
        totalPages,
        currentChapterTitle: currentChapter ? currentChapter.title : 'Chapter 1',
        lastReadAt: 'Yesterday',
      },
      chapters,
      stats: {
        chapterCount: chapters.length,
        totalPages,
        formulaCount: totalFormulas || 42,
        cqCount: totalCQs || 84,
        mcqCount: totalMCQs || 316,
        bookmarkCount: 12,
      },
      download: {
        status: isDownloaded ? 'ready' : downloadStatus,
        downloadedBytes: 146 * 1024 * 1024,
        totalBytes: 286 * 1024 * 1024,
        progressPercent: isDownloaded ? 100 : downloadProgress,
        isReady: isDownloaded,
      },
      formulasPreview,
      hasUpdate: false,
    };
  }, [book, activeVersion, access, chapters, formulasPreview, downloadStatus, downloadProgress, isDownloaded]);

  const startDownload = useCallback(() => {
    setDownloadStatus('downloading');
    setDownloadProgress(25);
    setTimeout(() => setDownloadProgress(65), 500);
    setTimeout(() => {
      setDownloadProgress(100);
      setDownloadStatus('ready');
      setIsDownloadSheetOpen(false);
    }, 1200);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return {
    viewModel,
    isLoading,
    refreshing,
    onRefresh,
    isNotFound: !isLoading && !book,
    isDownloadSheetOpen,
    setIsDownloadSheetOpen,
    startDownload,
  };
}
