import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
      gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection retention
      retry: (failureCount, error: any) => {
        // Do not retry 401/403/404 errors
        const status = error?.status || error?.cause?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // Prevent aggressive refetching on mobile app foreground
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
