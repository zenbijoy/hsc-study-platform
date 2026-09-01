import React, { createContext, useContext, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

interface NetworkContextValue {
  isOnline: boolean;
  isInternetReachable: boolean;
}

const NetworkContext = createContext<NetworkContextValue>({
  isOnline: true,
  isInternetReachable: true,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

  // In standard web/react-native environment, listen to navigator.onLine if available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'addEventListener' in window) {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, isInternetReachable: isOnline }}>
      {children}
      {!isOnline && (
        <View className="bg-amber-500 py-1 px-4 items-center">
          <Text className="text-[11px] font-bold text-black">
            Offline Mode — Showing local cached study materials
          </Text>
        </View>
      )}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
