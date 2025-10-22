/**
 * Hook to get NFTs owned by a specific wallet address
 * 
 * Filters from cached collection data instead of making new API calls.
 * Much faster than fetching individually for each user.
 */
import { useMemo } from 'react';
import { useCollectionNFTs } from './useCollectionData';
import type { GalacticXNFT } from '../types';

interface UseUserNFTsReturn {
  nfts: GalacticXNFT[];
  nftCount: number;
  hasNFTs: boolean;
  loading: boolean;
  error: Error | null;
  lastSynced: Date | null;
  refetch: () => Promise<void>;
}

/**
 * Get NFTs owned by a specific wallet address
 * 
 * @param walletAddress - The wallet address to filter NFTs for
 * @returns Filtered NFT data for the user
 */
export const useUserNFTs = (walletAddress?: string): UseUserNFTsReturn => {
  const { 
    data: allNFTs, 
    isLoading, 
    error, 
    dataUpdatedAt,
    refetch: refetchCollection 
  } = useCollectionNFTs();
  
  // Filter NFTs by owner address
  const userNFTs = useMemo(() => {
    if (!walletAddress || !allNFTs) {
      return [];
    }
    
    // Filter NFTs where owner matches the wallet address
    return allNFTs.filter(nft => 
      nft.owner && nft.owner.toLowerCase() === walletAddress.toLowerCase()
    );
  }, [allNFTs, walletAddress]);
  
  // Wrap refetch to return Promise<void>
  const refetch = async () => {
    await refetchCollection();
  };
  
  return {
    nfts: userNFTs,
    nftCount: userNFTs.length,
    hasNFTs: userNFTs.length > 0,
    loading: isLoading,
    error: error || null,
    lastSynced: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    refetch
  };
};

