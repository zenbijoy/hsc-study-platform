import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui/Typography';

export interface AuthScreenShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBrandIcon?: boolean;
}

export function AuthScreenShell({
  children,
  title,
  subtitle,
  showBrandIcon = true,
}: AuthScreenShellProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background }} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: theme.spacing.screenHorizontal,
            paddingVertical: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View className="items-center mb-6">
            {showBrandIcon && (
              <View
                style={{
                  backgroundColor: 'rgba(87, 224, 183, 0.12)',
                  borderColor: 'rgba(87, 224, 183, 0.25)',
                  borderWidth: 1,
                  borderRadius: theme.radius.xxl,
                  width: 60,
                  height: 60,
                }}
                className="items-center justify-center mb-4"
              >
                <Ionicons name="school" size={28} color={theme.colors.primary} />
              </View>
            )}

            <AppText variant="headlineLarge" color="primary" align="center" style={{ fontWeight: '800' }}>
              {title}
            </AppText>
            {subtitle && (
              <AppText variant="bodySmall" color="muted" align="center" className="mt-1.5 max-w-xs leading-5">
                {subtitle}
              </AppText>
            )}
          </View>

          {/* Form Content */}
          <View className="w-full max-w-md self-center">{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
