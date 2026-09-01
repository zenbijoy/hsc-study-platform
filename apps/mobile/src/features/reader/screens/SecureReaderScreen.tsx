import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import Pdf from 'react-native-pdf';
import { AppText } from '@/src/components/ui/Typography';
import { useSecureReader } from '../hooks/useSecureReader';
import { ReaderHeader } from '../components/ReaderHeader';
import { ReaderBottomToolbar } from '../components/ReaderBottomToolbar';
import { ReaderWatermark } from '../components/ReaderWatermark';
import { ReaderChapterDrawer } from '../components/ReaderChapterDrawer';
import { ReaderSearchSheet } from '../components/ReaderSearchSheet';
import { ReaderSettingsSheet } from '../components/ReaderSettingsSheet';

export function SecureReaderScreen({
  bookId,
  versionId,
  initialPage = 1,
}: {
  bookId: string;
  versionId?: string;
  initialPage?: number;
}) {
  const router = useRouter();
  const {
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
  } = useSecureReader(bookId, versionId, initialPage);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      {/* Top Reader Header */}
      <ReaderHeader
        title={book?.title || 'Secure Reader'}
        chapterTitle={sessionState.currentChapterTitle}
        palette={palette}
        onBack={() => router.back()}
        onOpenSearch={() => setIsSearchSheetOpen(true)}
        onOpenChapters={() => setIsChapterDrawerOpen(true)}
        onOpenSettings={() => setIsSettingsSheetOpen(true)}
      />

      {/* Main Reader Surface */}
      <View className="flex-1 p-3">
        {pdfFile ? (
          <View
            style={{
              backgroundColor: displayMode === 'sepia' ? '#1C1712' : '#FFFFFF',
            }}
            className="flex-1 overflow-hidden rounded-2xl shadow-2xl"
          >
            <Pdf
              source={{ uri: pdfFile.uri, cache: false }}
              style={{ flex: 1, width: '100%' }}
              page={sessionState.currentPage}
              horizontal={pageDirection === 'horizontal'}
              enablePaging={pageDirection === 'horizontal'}
              trustAllCerts={false}
              onLoadComplete={(count) => setTotalPages(count)}
              onPageChanged={(current) => goToPage(current)}
            />
          </View>
        ) : (
          /* Secure Sandbox Info State */
          <View
            style={{
              backgroundColor: '#0F1722',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              borderRadius: 24,
              padding: 24,
            }}
            className="flex-1 items-center justify-center"
          >
            <ActivityIndicator color={palette.accent} size="large" />

            <AppText
              variant="bodyMedium"
              color="secondary"
              className="mt-4 text-center font-medium"
            >
              {sessionState.message}
            </AppText>

            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                borderWidth: 1,
                borderRadius: 18,
                padding: 18,
                width: '100%',
                marginTop: 24,
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <AppText
                  variant="caption"
                  color="sky"
                  style={{ fontWeight: '800', letterSpacing: 1.5 }}
                >
                  HSCP SECURE SANDBOX
                </AppText>
                <View
                  style={{
                    backgroundColor: 'rgba(87, 224, 183, 0.15)',
                    borderRadius: 999,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <AppText variant="caption" color="mint" style={{ fontWeight: '700' }}>
                    AES-256-GCM
                  </AppText>
                </View>
              </View>

              <AppText variant="headlineMedium" color="primary" style={{ fontWeight: '800' }}>
                Page {sessionState.currentPage} of {sessionState.totalPages}
              </AppText>

              <AppText variant="caption" color="muted" className="mt-1 leading-5">
                Screenshot deterrence active. Dynamic watermark anchored to session. Temporary decrypted files auto-purge on app switch.
              </AppText>
            </View>
          </View>
        )}

        {/* Dynamic Non-Intrusive Watermark */}
        <ReaderWatermark
          sessionId={sessionState.sessionId}
          pageNumber={sessionState.currentPage}
          displayMode={displayMode}
        />
      </View>

      {/* Bottom Navigation Toolbar */}
      <ReaderBottomToolbar
        currentPage={sessionState.currentPage}
        totalPages={sessionState.totalPages}
        isBookmarked={sessionState.isBookmarked}
        palette={palette}
        onPreviousPage={previousPage}
        onNextPage={nextPage}
        onToggleBookmark={toggleBookmark}
        onOpenChapters={() => setIsChapterDrawerOpen(true)}
      />

      {/* Chapter Drawer */}
      <ReaderChapterDrawer
        visible={isChapterDrawerOpen}
        onClose={() => setIsChapterDrawerOpen(false)}
        chapters={chapters}
        currentPage={sessionState.currentPage}
        onSelectChapter={(ch) => goToPage(ch.startPage)}
      />

      {/* In-Book Search Sheet */}
      <ReaderSearchSheet
        visible={isSearchSheetOpen}
        onClose={() => setIsSearchSheetOpen(false)}
        chapters={chapters}
        onJumpToPage={(p) => goToPage(p)}
      />

      {/* Settings Sheet */}
      <ReaderSettingsSheet
        visible={isSettingsSheetOpen}
        onClose={() => setIsSettingsSheetOpen(false)}
        displayMode={displayMode}
        onChangeDisplayMode={setDisplayMode}
        pageDirection={pageDirection}
        onChangePageDirection={setPageDirection}
      />
    </View>
  );
}
