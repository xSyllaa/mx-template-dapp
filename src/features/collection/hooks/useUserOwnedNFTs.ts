/**
 * Hook to fetch and cache NFTs owned by a specific wallet address
 * 
 * This hook directly fetches NFTs from the MultiversX API endpoint:
 * GET /accounts/{address}/nfts?search=MAINSEASON-3db9f8
 * 
 * Data is cached for 1 hour per wallet address.
 * Much faster than loading the entire collection for a single user.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUserNFTs } from 'features/myNFTs/services/nftService';
import type { GalacticXNFT } from '../types';

/**
 * Query keys for user-owned NFTs cache
 */
export const userNFTsKeys = {
  all: ['userNFTs'] as const,
  byAddress: (address: string) => ['userNFTs', address] as const,
};

interface UseUserOwnedNFTsReturn {
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
 * Fetch and cache NFTs owned by a specific wallet address
 * 
 * @param walletAddress - The wallet address to fetch NFTs for
 * @returns User's NFTs with cache management
 */
export const useUserOwnedNFTs = (walletAddress?: string): UseUserOwnedNFTsReturn => {
  const queryClient = useQueryClient();
  
  const { 
    data, 
    isLoading, 
    error, 
    dataUpdatedAt,
    refetch: refetchQuery,
    isRefetching
  } = useQuery({
    queryKey: userNFTsKeys.byAddress(walletAddress || ''),
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error('Wallet address is required');
      }
      
      // Fetch user NFTs from MultiversX API
      const result = await fetchUserNFTs(walletAddress, true); // Include errors with fallback
      return result;
    },
    // Only fetch when we have a wallet address
    enabled: !!walletAddress && walletAddress.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour - fresh for 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours - keep in memory
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
 * Hook to manually refresh user's NFTs
 * 
 * Invalidates the user's NFT cache, forcing a refetch
 */
export const useRefreshUserNFTs = (walletAddress?: string) => {
  const queryClient = useQueryClient();
  
  const refreshUserNFTs = async () => {
    if (walletAddress) {
      await queryClient.invalidateQueries({ 
        queryKey: userNFTsKeys.byAddress(walletAddress) 
      });
    }
  };
  
  return refreshUserNFTs;
};

