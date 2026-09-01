import { useState, useCallback, useRef } from 'react';
import type { Chapter } from '@/src/types/book.types';
import type {
  PdfReaderController,
  ReaderDisplayMode,
  ReaderPageDirection,
  ReaderLocationHistoryItem,
} from '../types/reader.types';
import { ReaderLocationHistory, clampPage } from '../utils/pageNavigation';

export function useReaderController(options: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDisplayModeChange: (mode: ReaderDisplayMode) => void;
  onPageDirectionChange: (dir: ReaderPageDirection) => void;
  onBrightnessChange: (brightness: number) => void;
  onKeepScreenAwakeChange: (keepAwake: boolean) => void;
  onClose: () => Promise<void>;
}): {
  controller: PdfReaderController;
  controlsVisible: boolean;
  fullscreen: boolean;
} {
  const {
    currentPage,
    totalPages,
    onPageChange,
    onDisplayModeChange,
    onPageDirectionChange,
    onBrightnessChange,
    onKeepScreenAwakeChange,
    onClose,
  } = options;

  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const historyRef = useRef(new ReaderLocationHistory());
  const [canGoBackLoc, setCanGoBackLoc] = useState(false);

  const goToPage = useCallback(
    (page: number, recordHistory: boolean = false, trigger: ReaderLocationHistoryItem['trigger'] = 'jump') => {
      const clamped = clampPage(page, totalPages);
      if (recordHistory && clamped !== currentPage) {
        historyRef.current.push({
          pageNumber: currentPage,
          timestamp: Date.now(),
          trigger,
        });
        setCanGoBackLoc(true);
      }
      onPageChange(clamped);
    },
    [currentPage, totalPages, onPageChange]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [goToPage, currentPage]);

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [goToPage, currentPage]);

  const jumpToChapter = useCallback(
    (chapter: Chapter) => {
      goToPage(chapter.startPage, true, 'toc');
    },
    [goToPage]
  );

  const goBackLocation = useCallback(() => {
    const prev = historyRef.current.pop();
    if (prev) {
      onPageChange(prev.pageNumber);
      setCanGoBackLoc(historyRef.current.canGoBack());
    }
  }, [onPageChange]);

  const toggleControls = useCallback(() => {
    setControlsVisible((prev) => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setFullscreen((prev) => {
      const next = !prev;
      setControlsVisible(!next);
      return next;
    });
  }, []);

  const controller: PdfReaderController = {
    goToPage,
    nextPage,
    previousPage,
    jumpToChapter,
    canGoBackLocation: canGoBackLoc,
    goBackLocation,
    toggleControls,
    setControlsVisible,
    toggleFullscreen,
    setDisplayMode: onDisplayModeChange,
    setPageDirection: onPageDirectionChange,
    setBrightness: onBrightnessChange,
    setKeepScreenAwake: onKeepScreenAwakeChange,
    close: onClose,
  };

  return {
    controller,
    controlsVisible,
    fullscreen,
  };
}
