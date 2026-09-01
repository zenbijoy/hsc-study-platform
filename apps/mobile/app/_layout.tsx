import '../global.css';
import 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from '@/lib/query';
import { syncDirtyProgress } from '@/lib/progress';

export default function RootLayout() {
  useEffect(() => { syncDirtyProgress().catch(() => {}); }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#071018' } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="book/[id]" />
          <Stack.Screen name="reader/[id]" options={{ animation: 'fade' }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
