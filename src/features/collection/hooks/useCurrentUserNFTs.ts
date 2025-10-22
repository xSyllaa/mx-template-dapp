/**
 * Hook for current user's NFTs with manual injection support
 * 
 * This hook provides a single source of truth for the current user's NFTs.
 * All components (My NFTs, War Games, etc.) should use this hook.
 * 
 * Features:
 * - Automatic fetch on address change
 * - 1 hour cache per wallet
 * - Manual injection for testing (via setQueryData)
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGetAccount } from 'lib/sdkDapp';
import { fetchUserNFTs } from 'features/myNFTs/services/nftService';
import type { GalacticXNFT } from '../types';
import type { NFTOwnershipResult } from 'features/myNFTs/types';

/**
 * Query keys for current user NFTs
 */
export const currentUserNFTsKeys = {
  all: ['currentUserNFTs'] as const,
  byAddress: (address: string) => ['currentUserNFTs', address] as const,
};

interface UseCurrentUserNFTsReturn {
  nfts: GalacticXNFT[];
  nftCount: number;
  hasNFTs: boolean;
  loading: boolean;
  error: Error | null;
  lastSynced: Date | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

/**
 * Get NFTs for the currently connected wallet
 * 
 * This is the main hook that all features should use.
 * The cache is based on the connected wallet address.
 */
export const useCurrentUserNFTs = (): UseCurrentUserNFTsReturn => {
  const { address } = useGetAccount();
  
  const { 
    data, 
    isLoading, 
    error, 
    dataUpdatedAt,
    refetch: refetchQuery,
    isRefetching
  } = useQuery({
    queryKey: currentUserNFTsKeys.byAddress(address || ''),
    queryFn: async () => {
      if (!address) {
        return {
          hasNFTs: false,
          nftCount: 0,
          nfts: [],
          lastSynced: new Date()
        };
      }
      
      // Fetch user NFTs from MultiversX API
      const result = await fetchUserNFTs(address, true); // Include errors with fallback
      return result;
    },
    // Only fetch when we have a wallet address
    enabled: !!address && address.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  
  // Wrap refetch to return Promise<void>
  const refetch = async () => {
    await refetchQuery();
  };
  
  return {
    nfts: data?.nfts || [],
    nftCount: data?.nftCount || 0,
    hasNFTs: data?.hasNFTs || false,
    loading: isLoading,
    error: error || null,
    lastSynced: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    refetch,
    isRefetching
  };
};

/**
 * Hook to inject NFTs from another address into current user's cache
 * 
 * FOR TESTING/DEVELOPMENT ONLY
 * This allows testing features with NFTs from another wallet
 * without actually switching wallets.
 */
export const useInjectTestNFTs = () => {
  const queryClient = useQueryClient();
  const { address } = useGetAccount();
  
  /**
   * Fetch NFTs from a test address and inject them into current user's cache
   * 
   * @param testAddress - The address to fetch NFTs from
   */
  const injectNFTsFromAddress = async (testAddress: string) => {
    if (!address || !testAddress) {
      throw new Error('Both connected wallet and test address are required');
    }
    
    console.log(`🧪 [TEST MODE] Fetching NFTs from ${testAddress}`);
    console.log(`🧪 [TEST MODE] Will inject into cache for ${address}`);
    
    // Fetch NFTs from the test address
    const result = await fetchUserNFTs(testAddress, true);
    
    console.log(`✅ [TEST MODE] Fetched ${result.nftCount} NFTs from test address`);
    console.log(`💉 [TEST MODE] Injecting into cache for current user (${address})`);
    
    // Inject the fetched NFTs into the current user's cache
    queryClient.setQueryData(
      currentUserNFTsKeys.byAddress(address),
      result
    );
    
    console.log(`✅ [TEST MODE] NFTs injected successfully!`);
    console.log(`⚠️  [TEST MODE] War Games and other features will now use these ${result.nftCount} NFTs`);
    
    return result;
  };
  
  /**
   * Reset to actual wallet NFTs
   */
  const resetToWalletNFTs = async () => {
    if (!address) return;
    
    console.log(`🔄 [TEST MODE] Resetting to actual wallet NFTs for ${address}`);
    
    // Invalidate the cache to force refetch
    await queryClient.invalidateQueries({ 
      queryKey: currentUserNFTsKeys.byAddress(address) 
    });
    
    console.log(`✅ [TEST MODE] Reset complete - showing real wallet NFTs`);
  };
  
  return {
    injectNFTsFromAddress,
    resetToWalletNFTs
  };
};

