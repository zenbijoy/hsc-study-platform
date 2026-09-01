import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';

export function FormulaHero({
  onStartRevision,
}: {
  onStartRevision?: () => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surfaceElevated,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.xxl,
        padding: 18,
      }}
      className="mb-4"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <AppText variant="caption" color="mint" style={{ fontWeight: '800', letterSpacing: 1.5 }}>
            FORMULA VAULT & GRAPH
          </AppText>
          <AppText variant="headlineMedium" color="primary" style={{ fontWeight: '800' }}>
            HSC Formula Hub
          </AppText>
          <AppText variant="caption" color="muted" className="mt-1">
            NCTB textbook equations, variables, and cross-linked board problems
          </AppText>
        </View>

        {onStartRevision && (
          <Pressable
            onPress={onStartRevision}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.xl,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
            accessibilityRole="button"
            accessibilityLabel="Start Formula Revision"
            className="flex-row items-center gap-1.5 active:opacity-85 shadow-md"
          >
            <Ionicons name="flash" size={16} color="#071018" />
            <AppText variant="caption" style={{ color: '#071018', fontWeight: '800' }}>
              Revise
            </AppText>
          </Pressable>
        )}
      </View>

      <View className="flex-row gap-2 mt-4 pt-3 border-t border-white/5">
        <View className="flex-1 bg-white/[0.03] rounded-xl p-2 items-center">
          <AppText variant="labelLarge" color="mint" style={{ fontWeight: '800' }}>
            240+
          </AppText>
          <AppText variant="caption" color="muted">
            Physics
          </AppText>
        </View>
        <View className="flex-1 bg-white/[0.03] rounded-xl p-2 items-center">
          <AppText variant="labelLarge" color="sky" style={{ fontWeight: '800' }}>
            185+
          </AppText>
          <AppText variant="caption" color="muted">
            Chemistry
          </AppText>
        </View>
        <View className="flex-1 bg-white/[0.03] rounded-xl p-2 items-center">
          <AppText variant="labelLarge" color="rose" style={{ fontWeight: '800' }}>
            620+
          </AppText>
          <AppText variant="caption" color="muted">
            Math
          </AppText>
        </View>
      </View>
    </View>
  );
}
