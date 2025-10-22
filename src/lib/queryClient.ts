/**
 * TanStack Query Client Configuration
 * 
 * Centralized cache configuration for NFT collection data
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default cache settings (5 minutes for dynamic data - most common case)
      staleTime: 1000 * 60 * 5, // 5 minutes for dynamic data
      gcTime: 1000 * 60 * 10, // 10 minutes

      // Retry failed requests twice
      retry: 2,

      // Retry delay increases exponentially
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Don't refetch on window focus by default (can be overridden per query)
      refetchOnWindowFocus: false,

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,

      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

