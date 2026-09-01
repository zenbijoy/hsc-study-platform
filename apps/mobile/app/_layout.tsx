import '../global.css';
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { syncDirtyProgress } from '@/lib/progress';
import { AppProviders } from '@/src/providers/AppProviders';
import { executeStartupSequence, StartupContext } from '@/src/bootstrap/startupOrchestrator';
import { BootSplashScreen } from '@/src/components/shell/BootSplashScreen';
import { StartupErrorScreen } from '@/src/components/shell/StartupErrorScreen';

// Prevent native splash from disappearing before React orchestrator is ready
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootAppNavigator() {
  const [startupContext, setStartupContext] = useState<StartupContext | null>(null);
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  const initApp = async () => {
    try {
      const minDurationPromise = new Promise((resolve) => setTimeout(resolve, 600));
      const [ctx] = await Promise.all([executeStartupSequence(), minDurationPromise]);
      setStartupContext(ctx);
      await SplashScreen.hideAsync().catch(() => {});
      setIsSplashComplete(true);
    } catch (e) {
      await SplashScreen.hideAsync().catch(() => {});
      setStartupContext({
        stage: 'error',
        authStatus: 'error',
        userProfile: null,
        initialRoute: '/(tabs)',
        bootTimeMs: 0,
        error: {
          code: 'UNKNOWN',
          message: 'An unexpected startup failure occurred.',
        },
      });
      setIsSplashComplete(true);
    }
  };

  useEffect(() => {
    initApp();
    syncDirtyProgress().catch(() => {});
  }, []);

  if (!isSplashComplete || !startupContext) {
    return <BootSplashScreen statusMessage="Preparing your study environment…" />;
  }

  if (startupContext.stage === 'error' && startupContext.error) {
    return (
      <StartupErrorScreen
        errorCode={startupContext.error.code}
        errorMessage={startupContext.error.message}
        onRetry={initApp}
        allowOfflineBypass={startupContext.error.code !== 'LOCAL_DATABASE_FAILED'}
        onContinueOffline={() => {
          setStartupContext({
            ...startupContext,
            stage: 'ready',
          });
        }}
      />
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#071018' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="book/[id]" />
        <Stack.Screen name="reader/[id]" options={{ animation: 'fade' }} />
        <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
        <Stack.Screen name="dev/design-system" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootAppNavigator />
    </AppProviders>
  );
}
