/**
 * Custom hook for fetching and managing user's NFTs
 */
import { useState, useEffect, useCallback } from 'react';
import { useGetAccount } from 'lib/sdkDapp';
import { fetchUserNFTs } from '../services/nftService';
import type { GalacticXNFT, NFTOwnershipResult } from '../types';

interface UseMyNFTsReturn {
  nfts: GalacticXNFT[];
  nftCount: number;
  hasNFTs: boolean;
  loading: boolean;
  error: Error | null;
  lastSynced: Date | null;
  refetch: () => Promise<void>;
  fetchNFTsForAddress: (customAddress: string) => Promise<void>;
}

/**
 * Hook to fetch and manage user's GalacticX NFTs
 * @param customAddress - Optional custom address to fetch NFTs for (for testing)
 * @param includeErrors - Whether to include NFTs with metadata errors (for War Games)
 */
export const useMyNFTs = (customAddress?: string, includeErrors: boolean = false): UseMyNFTsReturn => {
  const { address: connectedAddress } = useGetAccount();
  
  // Use custom address if provided, otherwise use connected wallet address
  const address = customAddress || connectedAddress;
  
  const [nfts, setNFTs] = useState<GalacticXNFT[]>([]);
  const [nftCount, setNFTCount] = useState(0);
  const [hasNFTs, setHasNFTs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  
  /**
   * Fetch NFTs from MultiversX API
   */
  const fetchNFTs = useCallback(async () => {
    // Reset error state
    setError(null);
    
    // Check if wallet is connected
    if (!address) {
      setLoading(false);
      setNFTs([]);
      setNFTCount(0);
      setHasNFTs(false);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`🔍 useMyNFTs: Fetching NFTs for address: ${address}`);
      console.log(`🔧 useMyNFTs: Include errors mode: ${includeErrors}`);
      
      const result: NFTOwnershipResult = await fetchUserNFTs(address, includeErrors);
      
      console.log(`✅ useMyNFTs: Successfully fetched ${result.nftCount} NFTs`);
      console.log(`📋 useMyNFTs: NFTs array length: ${result.nfts.length}`);
      
      setNFTs(result.nfts);
      setNFTCount(result.nftCount);
      setHasNFTs(result.hasNFTs);
      setLastSynced(result.lastSynced);
    } catch (err) {
      console.error('Failed to fetch NFTs:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      // Set empty state on error
      setNFTs([]);
      setNFTCount(0);
      setHasNFTs(false);
    } finally {
      setLoading(false);
    }
  }, [address]);
  
  /**
   * Auto-fetch NFTs when address changes
   */
  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);
  
  /**
   * Manual refetch function
   */
  const refetch = useCallback(async () => {
    await fetchNFTs();
  }, [fetchNFTs]);
  
  /**
   * Fetch NFTs for a specific address (for testing)
   */
  const fetchNFTsForAddress = useCallback(async (testAddress: string) => {
    setError(null);
    
    if (!testAddress) {
      setError(new Error('Please provide a valid address'));
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`🔍 fetchNFTsForAddress: Fetching NFTs for test address: ${testAddress}`);
      console.log(`🔧 fetchNFTsForAddress: Include errors mode: ${includeErrors}`);
      
      const result: NFTOwnershipResult = await fetchUserNFTs(testAddress, includeErrors);
      
      console.log(`✅ fetchNFTsForAddress: Successfully fetched ${result.nftCount} NFTs`);
      console.log(`📋 fetchNFTsForAddress: NFTs array length: ${result.nfts.length}`);
      
      setNFTs(result.nfts);
      setNFTCount(result.nftCount);
      setHasNFTs(result.hasNFTs);
      setLastSynced(result.lastSynced);
    } catch (err) {
      console.error('Failed to fetch NFTs:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      // Set empty state on error
      setNFTs([]);
      setNFTCount(0);
      setHasNFTs(false);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    nfts,
    nftCount,
    hasNFTs,
    loading,
    error,
    lastSynced,
    refetch,
    fetchNFTsForAddress
  };
};

