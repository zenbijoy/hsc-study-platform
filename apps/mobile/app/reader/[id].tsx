import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as ScreenCapture from 'expo-screen-capture';
import { File } from 'expo-file-system';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Pressable, Text, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { ChapterListModal } from '@/components/ChapterListModal';
import { SessionWatermark } from '@/components/SessionWatermark';
import { demoChapters, type Chapter } from '@/data/demo';
import { getBooks } from '@/lib/catalog';
import { getDownloadedPackage } from '@/lib/download';
import { materializePdfToCache, secureDeleteCacheFile } from '@/lib/hscp';
import { getCachedContentKey } from '@/lib/license';
import { saveReadingProgress } from '@/lib/progress';
import { useStudyStore, type ReaderTheme } from '@/store/studyStore';

const themeBgMap: Record<ReaderTheme, string> = {
  dark: '#05090D',
  sepia: '#1C1712',
  midnight: '#081018',
  light: '#F1F5F9',
};

const themeBarMap: Record<ReaderTheme, string> = {
  dark: '#0B151E',
  sepia: '#2A221B',
  midnight: '#0F1E2C',
  light: '#E2E8F0',
};

const themeTextMap: Record<ReaderTheme, string> = {
  dark: '#FFFFFF',
  sepia: '#F5E6D3',
  midnight: '#E2F1FF',
  light: '#0F172A',
};

export default function SecureReader() {
  const { id, version, initialPage } = useLocalSearchParams<{
    id: string;
    version?: string;
    initialPage?: string;
  }>();
  const router = useRouter();
  const { data: books = [] } = useQuery({ queryKey: ['books'], queryFn: getBooks });
  const book = books.find((b: any) => b.id === id) ?? books[0];
  const session = useMemo(() => `S-${Math.random().toString(16).slice(2, 8).toUpperCase()}`, []);
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const tempRef = useRef<File | null>(null);
  const [readerMessage, setReaderMessage] = useState('Checking protected offline package…');
  const [page, setPage] = useState(initialPage ? parseInt(initialPage, 10) : (book?.lastPage ?? 1));
  const [pages, setPages] = useState(book?.pages ?? 720);
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [themeMenuVisible, setThemeMenuVisible] = useState(false);

  const readerTheme = useStudyStore((state) => state.readerTheme);
  const setReaderTheme = useStudyStore((state) => state.setReaderTheme);
  const addBookmark = useStudyStore((state) => state.addBookmark);
  const bookBookmarks = useStudyStore((state) => state.getBookBookmarks(id ?? ''));

  const bookChapters = demoChapters.filter((c) => c.bookId === id) || [];
  const isBookmarked = bookBookmarks.some((b) => b.page === page);

  // Screen capture guard
  useEffect(() => {
    const key = `reader-${id ?? 'book'}`;
    ScreenCapture.preventScreenCaptureAsync(key).catch(() => {});
    return () => {
      ScreenCapture.allowScreenCaptureAsync(key).catch(() => {});
    };
  }, [id]);

  // Clean decrypted cache when leaving foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && tempRef.current) {
        secureDeleteCacheFile(tempRef.current);
        tempRef.current = null;
        setPdfFile(null);
        setReaderMessage('Protected cache was purged upon leaving the foreground. Re-open to decrypt again.');
      }
    });
    return () => sub.remove();
  }, []);

  // Decrypt package
  useEffect(() => {
    let active = true;
    (async () => {
      if (!version) {
        setReaderMessage('Demo mode — real PDF decrypts once a protected .hscp version is downloaded.');
        return;
      }
      const encrypted = getDownloadedPackage(version);
      const contentKey = await getCachedContentKey(version);
      if (!encrypted || !contentKey) {
        setReaderMessage('Offline package not yet downloaded. Go back and tap Encrypted Download.');
        return;
      }
      setReaderMessage('Decrypting AES-256-GCM chunks into secure sandbox cache…');
      try {
        const temp = await materializePdfToCache(encrypted.uri, contentKey);
        if (!active) {
          secureDeleteCacheFile(temp);
          return;
        }
        tempRef.current = temp;
        setPdfFile(temp);
        setReaderMessage('');
      } catch (e: any) {
        setReaderMessage(e?.message ?? 'Unable to open protected package');
      }
    })();
    return () => {
      active = false;
      secureDeleteCacheFile(tempRef.current);
      tempRef.current = null;
    };
  }, [version]);

  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      Alert.alert('Bookmark', `Page ${page} is already bookmarked in your study vault.`);
    } else {
      addBookmark({
        bookId: id ?? 'book',
        page,
        chapterTitle: `Page ${page}`,
        note: `Saved bookmark during study session`,
      });
      Alert.alert('Bookmark Added', `Page ${page} saved to your bookmarks.`);
    }
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setPage(chapter.startPage);
    saveReadingProgress(id ?? '', chapter.startPage, pages).catch(() => {});
  };

  const currentBg = themeBgMap[readerTheme];
  const currentBar = themeBarMap[readerTheme];
  const currentText = themeTextMap[readerTheme];

  return (
    <View style={{ flex: 1, backgroundColor: currentBg }}>
      {/* Top Bar */}
      <View
        style={{ backgroundColor: currentBar }}
        className="flex-row items-center justify-between border-b border-white/10 px-5 pb-4 pt-14"
      >
        <Pressable onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" color={currentText} size={23} />
        </Pressable>

        <View className="items-center max-w-[65%]">
          <Text
            style={{ color: currentText }}
            className="text-sm font-bold text-center"
            numberOfLines={1}
          >
            {book?.title ?? 'Secure Reader'}
          </Text>
          <Text className="mt-0.5 text-[10px] font-bold tracking-[1.5px] text-mint">
            PROTECTED HSCP SESSION
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => setThemeMenuVisible(!themeMenuVisible)} className="p-1">
            <Ionicons name="color-palette-outline" color={currentText} size={20} />
          </Pressable>
          <Pressable onPress={() => setChapterModalVisible(true)} className="p-1">
            <Ionicons name="list-outline" color={currentText} size={22} />
          </Pressable>
        </View>
      </View>

      {/* Theme Picker Dropdown */}
      {themeMenuVisible && (
        <View
          style={{ backgroundColor: currentBar }}
          className="flex-row items-center justify-around border-b border-white/10 py-3 px-4"
        >
          {(['dark', 'sepia', 'midnight', 'light'] as ReaderTheme[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => {
                setReaderTheme(t);
                setThemeMenuVisible(false);
              }}
              className={`rounded-xl px-3 py-1.5 border ${
                readerTheme === t ? 'border-mint bg-mint/15' : 'border-white/10'
              }`}
            >
              <Text
                style={{ color: currentText }}
                className="text-xs font-bold uppercase tracking-wider"
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Reader Content */}
      <View className="flex-1 p-3">
        {pdfFile ? (
          <View className="flex-1 overflow-hidden rounded-2xl bg-white shadow-2xl">
            <Pdf
              source={{ uri: pdfFile.uri, cache: false }}
              style={{ flex: 1, width: '100%' }}
              page={Math.max(1, page)}
              enablePaging={false}
              trustAllCerts={false}
              onLoadComplete={(count) => setPages(count)}
              onPageChanged={(current) => {
                setPage(current);
                saveReadingProgress(id ?? '', current, pages).catch(() => {});
              }}
              onError={(error) => setReaderMessage(String(error))}
            />
          </View>
        ) : (
          /* Placeholder / Info View */
          <View className="flex-1 items-center justify-center rounded-2xl border border-white/10 bg-panel p-8">
            <ActivityIndicator color="#57E0B7" size="large" />
            <Text className="mt-5 text-center text-sm leading-6 text-white/60 font-semibold">
              {readerMessage}
            </Text>

            <View className="mt-8 w-full rounded-2xl bg-white/[0.04] p-5 border border-white/10">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-[2px] text-sky">
                  HSCP Secure Sandbox
                </Text>
                <View className="rounded-full bg-mint/15 px-2.5 py-0.5">
                  <Text className="text-[10px] font-bold text-mint">AES-256-GCM</Text>
                </View>
              </View>

              <Text className="mt-4 text-2xl font-black text-white">
                Page {page} of {pages}
              </Text>
              <Text className="mt-2 text-xs leading-5 text-white/50">
                Screen capture prevention active. Watermark anchored to session. Temporary decrypted files are auto-purged on exit.
              </Text>

              <Pressable
                onPress={() => setChapterModalVisible(true)}
                className="mt-5 flex-row items-center justify-center gap-2 rounded-xl bg-mint py-3"
              >
                <Ionicons name="list" size={16} color="#071018" />
                <Text className="text-xs font-black text-[#071018]">Browse Chapter Index</Text>
              </Pressable>
            </View>
          </View>
        )}

        <SessionWatermark session={session} />
      </View>

      {/* Bottom Toolbar */}
      <View
        style={{ backgroundColor: currentBar }}
        className="flex-row items-center justify-around border-t border-white/10 px-5 py-4"
      >
        <Pressable
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="p-1 active:opacity-60"
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={page <= 1 ? '#4B5563' : currentText}
          />
        </Pressable>

        <Pressable onPress={handleBookmarkToggle} className="p-1 active:opacity-60">
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isBookmarked ? '#57E0B7' : currentText}
          />
        </Pressable>

        <View className="rounded-full bg-white/10 px-4 py-1.5">
          <Text style={{ color: currentText }} className="text-xs font-black">
            {page} / {pages}
          </Text>
        </View>

        <Pressable onPress={() => setChapterModalVisible(true)} className="p-1 active:opacity-60">
          <Ionicons name="book-outline" size={22} color={currentText} />
        </Pressable>

        <Pressable
          onPress={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page >= pages}
          className="p-1 active:opacity-60"
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={page >= pages ? '#4B5563' : currentText}
          />
        </Pressable>
      </View>

      {/* Chapter Index Modal */}
      <ChapterListModal
        visible={chapterModalVisible}
        chapters={bookChapters}
        bookTitle={book?.title ?? 'Chapters'}
        onClose={() => setChapterModalVisible(false)}
        onSelectChapter={handleSelectChapter}
      />
    </View>
  );
}
