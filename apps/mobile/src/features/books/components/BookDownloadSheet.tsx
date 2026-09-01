import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';
import { LinearProgress } from '@/src/components/ui/Progress';
import { BookDetailsViewModel } from '../types/bookDetails.types';

export function BookDownloadSheet({
  visible,
  onClose,
  viewModel,
  onStartDownload,
}: {
  visible: boolean;
  onClose: () => void;
  viewModel: BookDetailsViewModel;
  onStartDownload: () => void;
}) {
  const theme = useTheme();
  const { download } = viewModel;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
        className="flex-1 justify-end"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.colors.surfaceElevated,
            borderTopLeftRadius: theme.radius.xxl,
            borderTopRightRadius: theme.radius.xxl,
            padding: 20,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-white/10 mb-3">
            <View>
              <AppText variant="titleLarge" color="primary" style={{ fontWeight: '800' }}>
                Offline Package Download
              </AppText>
              <AppText variant="caption" color="muted">
                Encrypted .HSCP package for offline reading
              </AppText>
            </View>
            <Ionicons name="close" size={22} color={theme.colors.textMuted} onPress={onClose} />
          </View>

          {/* Storage Information */}
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.lg,
              padding: 14,
            }}
            className="mb-4"
          >
            <View className="flex-row items-center justify-between mb-1.5">
              <AppText variant="labelMedium" color="primary">
                Full Textbook Package
              </AppText>
              <AppText variant="labelMedium" color="mint" style={{ fontWeight: '700' }}>
                286 MB
              </AppText>
            </View>

            <View className="flex-row items-center justify-between">
              <AppText variant="caption" color="muted">
                Available Device Storage:
              </AppText>
              <AppText variant="caption" color="secondary">
                1.8 GB free
              </AppText>
            </View>
          </View>

          {/* Progress / Status */}
          {download.status === 'downloading' ? (
            <View className="my-3">
              <View className="flex-row items-center justify-between mb-2">
                <AppText variant="caption" color="mint">
                  Downloading encrypted book package...
                </AppText>
                <AppText variant="caption" color="mint" style={{ fontWeight: '700' }}>
                  {download.progressPercent}%
                </AppText>
              </View>
              <LinearProgress percentage={download.progressPercent} height={6} color={theme.colors.primary} />
            </View>
          ) : download.isReady ? (
            <View
              style={{
                backgroundColor: 'rgba(87, 224, 183, 0.15)',
                borderRadius: theme.radius.lg,
                padding: 14,
              }}
              className="items-center flex-row gap-3 mb-4"
            >
              <Ionicons name="checkmark-circle" size={24} color="#57E0B7" />
              <View className="flex-1">
                <AppText variant="labelMedium" color="mint">
                  Package Verified & Ready
                </AppText>
                <AppText variant="caption" color="muted">
                  Available for offline study anytime
                </AppText>
              </View>
            </View>
          ) : (
            /* Action Button */
            <Pressable
              onPress={onStartDownload}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.lg,
                paddingVertical: 14,
                alignItems: 'center',
              }}
              className="active:opacity-85 shadow-lg mb-2"
            >
              <AppText variant="labelMedium" style={{ color: '#071018', fontWeight: '800' }}>
                Start Offline Download (286 MB)
              </AppText>
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
