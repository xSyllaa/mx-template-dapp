/**
 * Collection Service - Handles MultiversX API calls for collection data
 * 
 * This service fetches collection-level data and all NFTs in the collection.
 * Data is cached by TanStack Query for optimal performance.
 */
import axios from 'axios';
import type { CollectionInfo, GalacticXNFT } from '../types';
import type { MultiversXNFT } from 'features/myNFTs/types';

// Collection identifier for GalacticX NFTs
const GALACTIC_COLLECTION_ID = 'MAINSEASON-3db9f8';

// MultiversX API base URL - Always use mainnet
const API_BASE_URL = 'https://api.multiversx.com';

/**
 * Import parseNFT from existing nftService to ensure consistency
 */
import { parseNFT } from 'features/myNFTs/services/nftService';

/**
 * Fetch collection information
 */
export const fetchCollectionInfo = async (): Promise<CollectionInfo> => {
  try {
    const response = await axios.get<CollectionInfo>(
      `${API_BASE_URL}/collections/${GALACTIC_COLLECTION_ID}`,
      {
        timeout: 10000,
        headers: {
          'accept': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching collection info:', error);
    
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch collection information. Please try again.'
      );
    }
    
    throw new Error('An unexpected error occurred while fetching collection info.');
  }
};

/**
 * Fetch total NFT count in collection
 */
export const fetchCollectionNFTCount = async (): Promise<number> => {
  try {
    const response = await axios.get<number>(
      `${API_BASE_URL}/collections/${GALACTIC_COLLECTION_ID}/nfts/count`,
      {
        timeout: 10000,
        headers: {
          'accept': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching NFT count:', error);
    
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch NFT count. Please try again.'
      );
    }
    
    throw new Error('An unexpected error occurred while fetching NFT count.');
  }
};

/**
 * Fetch all NFTs in the collection in a single request
 * 
 * @param totalCount - Total number of NFTs (optional, will fetch if not provided)
 * @returns Array of parsed NFTs with player mapping
 */
export const fetchAllCollectionNFTs = async (totalCount?: number): Promise<GalacticXNFT[]> => {
  try {
    // Get total count if not provided
    const count = totalCount || await fetchCollectionNFTCount();
    
    // Check if count exceeds API limit
    if (count > 10000) {
      throw new Error(`Collection has ${count} NFTs, which exceeds the API limit of 10,000. Please contact support.`);
    }
    
    const response = await axios.get<MultiversXNFT[]>(
      `${API_BASE_URL}/collections/${GALACTIC_COLLECTION_ID}/nfts`,
      {
        params: {
          size: count
        },
        timeout: 30000, // Increased timeout for large request
        headers: {
          'accept': 'application/json'
        }
      }
    );
    
    console.log(`✅ API response: ${response.data.length} NFTs received`);
    
    // Parse NFTs using the existing parseNFT function (now async for IPFS recovery)
    // includeErrors=true to include NFTs with metadata errors (with fallback values)
    const parsedNFTsPromises = response.data.map(nft => parseNFT(nft, true));
    const parsedNFTs = await Promise.all(parsedNFTsPromises);
    
    const allNFTs = parsedNFTs.filter((nft): nft is GalacticXNFT => nft !== null);
    
    console.log(`✅ Collection loaded: ${allNFTs.length} NFTs (${((allNFTs.length / count) * 100).toFixed(1)}%)`);
    
    return allNFTs;
  } catch (error) {
    console.error('Error fetching collection NFTs:', error);
    
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch collection NFTs. Please try again.'
      );
    }
    
    throw new Error('An unexpected error occurred while fetching NFTs.');
  }
};

/**
 * Export service object for convenience
 */
export const collectionService = {
  fetchCollectionInfo,
  fetchCollectionNFTCount,
  fetchAllCollectionNFTs
};

