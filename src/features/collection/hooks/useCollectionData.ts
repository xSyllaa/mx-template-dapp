/**
 * React Query Hooks for Collection Data
 * 
 * These hooks provide cached access to collection-level data:
 * - Collection information
 * - Total NFT count
 * - All NFTs in the collection
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  fetchCollectionInfo, 
  fetchCollectionNFTCount, 
  fetchAllCollectionNFTs 
} from '../services/collectionService';
import type { CollectionInfo, GalacticXNFT } from '../types';

/**
 * Query keys for cache management
 */
export const collectionKeys = {
  all: ['collection'] as const,
  info: ['collection', 'info'] as const,
  nftCount: ['collection', 'nftCount'] as const,
  nfts: ['collection', 'nfts'] as const,
};

/**
 * Hook to fetch collection information
 * 
 * Cached for 1 hour, manually refreshable
 */
export const useCollectionInfo = () => {
  return useQuery({
    queryKey: collectionKeys.info,
    queryFn: fetchCollectionInfo,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

/**
 * Hook to fetch total NFT count
 * 
 * Cached for 1 hour, manually refreshable
 */
export const useCollectionNFTCount = () => {
  return useQuery({
    queryKey: collectionKeys.nftCount,
    queryFn: fetchCollectionNFTCount,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

/**
 * Hook to fetch all NFTs in the collection
 * 
 * This is the main data source for all NFT-related features.
 * Cached for 1 hour, manually refreshable.
 * 
 * @returns Query result with all NFTs
 */
export const useCollectionNFTs = () => {
  const { data: totalCount } = useCollectionNFTCount();
  
  return useQuery<GalacticXNFT[], Error>({
    queryKey: collectionKeys.nfts,
    queryFn: () => fetchAllCollectionNFTs(totalCount),
    // Only fetch when we have the count
    enabled: totalCount !== undefined && totalCount > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
    // This is a heavy operation, keep it in cache longer
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });
};

/**
 * Hook to manually refresh collection data
 * 
 * Invalidates all collection queries, forcing a refetch
 */
export const useRefreshCollection = () => {
  const queryClient = useQueryClient();
  
  const refreshCollection = async () => {
    await queryClient.invalidateQueries({ queryKey: collectionKeys.all });
  };
  
  return refreshCollection;
};

