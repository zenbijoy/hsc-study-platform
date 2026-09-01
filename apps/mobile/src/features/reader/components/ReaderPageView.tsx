import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';
import type { ReaderSettings } from '../types/reader.types';
import type { ReaderThemePalette } from '../utils/readerTheme';

export function ReaderPageView({
  uri,
  currentPage,
  settings,
  palette,
  onPageChanged,
  onLoadComplete,
  onTapCanvas,
}: {
  uri: string;
  currentPage: number;
  settings: ReaderSettings;
  palette: ReaderThemePalette;
  onPageChanged: (page: number) => void;
  onLoadComplete: (totalPages: number) => void;
  onTapCanvas: () => void;
}) {
  const isHorizontal = settings.pageDirection === 'horizontal';

  return (
    <View style={[styles.container, { backgroundColor: palette.canvasBackground }]}>
      <Pressable onPress={onTapCanvas} style={styles.pressableContainer}>
        <Pdf
          source={{ uri, cache: false }}
          style={styles.pdfView}
          page={currentPage}
          horizontal={isHorizontal}
          enablePaging={isHorizontal}
          trustAllCerts={false}
          spacing={8}
          minScale={1.0}
          maxScale={3.5}
          onLoadComplete={(count) => onLoadComplete(count)}
          onPageChanged={(current) => onPageChanged(current)}
          onError={() => {}}
        />

        {/* Sepia / Theme Eye Comfort Filter Layer */}
        {palette.pdfFilterColor && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: palette.pdfFilterColor },
            ]}
          />
        )}

        {/* In-App Dimming Layer (if brightness < 1.0) */}
        {settings.brightness < 1.0 && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: `rgba(0, 0, 0, ${(1.0 - settings.brightness) * 0.75})`,
              },
            ]}
          />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  pressableContainer: {
    flex: 1,
  },
  pdfView: {
    flex: 1,
    width: '100%',
  },
});
