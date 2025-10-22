/**
 * Hook to get specific NFTs by their identifiers
 * 
 * Filters from cached collection data instead of making individual API calls.
 * Ideal for Team of the Week and other features that need specific NFTs.
 */
import { useMemo } from 'react';
import { useCollectionNFTs } from './useCollectionData';
import type { GalacticXNFT } from '../types';

interface UseNFTsByIdentifiersReturn {
  nfts: GalacticXNFT[];
  nftMap: Map<string, GalacticXNFT>;
  loading: boolean;
  error: Error | null;
  allFound: boolean;
  missingIdentifiers: string[];
}

/**
 * Get NFTs by their identifiers
 * 
 * @param identifiers - Array of NFT identifiers to find
 * @returns Filtered NFT data matching the identifiers
 */
export const useNFTsByIdentifiers = (identifiers: string[]): UseNFTsByIdentifiersReturn => {
  const { 
    data: allNFTs, 
    isLoading, 
    error 
  } = useCollectionNFTs();
  
  // Filter and map NFTs by identifiers
  const result = useMemo(() => {
    if (!allNFTs || identifiers.length === 0) {
      return {
        nfts: [],
        nftMap: new Map<string, GalacticXNFT>(),
        allFound: false,
        missingIdentifiers: identifiers
      };
    }
    
    // Create a Set for faster lookup
    const identifierSet = new Set(identifiers.map(id => id.toLowerCase()));
    
    // Filter NFTs that match the identifiers
    const matchedNFTs = allNFTs.filter(nft => 
      identifierSet.has(nft.identifier.toLowerCase())
    );
    
    // Create a map for easy lookup
    const nftMap = new Map<string, GalacticXNFT>();
    matchedNFTs.forEach(nft => {
      nftMap.set(nft.identifier, nft);
    });
    
    // Find missing identifiers
    const foundIdentifiers = new Set(
      matchedNFTs.map(nft => nft.identifier.toLowerCase())
    );
    const missingIdentifiers = identifiers.filter(
      id => !foundIdentifiers.has(id.toLowerCase())
    );
    
    return {
      nfts: matchedNFTs,
      nftMap,
      allFound: missingIdentifiers.length === 0,
      missingIdentifiers
    };
  }, [allNFTs, identifiers]);
  
  return {
    ...result,
    loading: isLoading,
    error: error || null
  };
};

