/**
 * NFT Service - Handles MultiversX API calls for NFT data
 */
import axios from 'axios';
import type { MultiversXNFT, GalacticXNFT, NFTAttributes, NFTOwnershipResult } from '../types';
import { getRealPlayerName } from '../../../data/playerDataService';

// Collection identifier for GalacticX NFTs
const GALACTIC_COLLECTION_ID = 'MAINSEASON-3db9f8';

// MultiversX API base URL - Always use mainnet
const API_BASE_URL = 'https://api.multiversx.com';

/**
 * Parse NFT attributes from metadata
 */
const parseNFTAttributes = (metadata?: MultiversXNFT['metadata']): NFTAttributes => {
  if (!metadata || !metadata.attributes || metadata.attributes.length === 0) {
    return {};
  }

  try {
    const attributes: Record<string, string | number> = {};
    
    // Parse attributes array from metadata
    metadata.attributes.forEach((attr) => {
      const { trait_type, value } = attr;
      
      if (!trait_type || value === undefined) return;
      
      const key = trait_type.toLowerCase().replace(/\s+/g, '_');
      
      // Try to parse as number
      const numValue = Number(value);
      if (!isNaN(numValue) && value !== '') {
        attributes[key] = numValue;
      } else {
        attributes[key] = String(value);
      }
    });
    
    return attributes as NFTAttributes;
  } catch (error) {
    console.error('Failed to parse NFT attributes:', error);
    return {};
  }
};

/**
 * Determine NFT rarity from attributes
 * Special Perk cards (Team Emblem, Stadium, Manager, Champions L. Card, Europa L.Card) are Legendary
 */
const determineRarity = (attributes: NFTAttributes, rawNFT: MultiversXNFT): GalacticXNFT['rarity'] => {
  // Check if it's a special perk card
  if (attributes.special_perk) {
    // Special perks are considered Legendary
    return 'Legendary';
  }
  
  // Count performance attributes
  const performanceCount = [
    attributes.performance_1,
    attributes.performance_2,
    attributes.performance_3,
    attributes.performance_4,
    attributes.performance_5,
    attributes.performance_6,
    attributes.performance_7,
    attributes.performance_8,
    attributes.performance_9,
    attributes.performance_10,
    attributes.performance_11,
    attributes.performance_12
  ].filter(perf => perf && perf !== 'None').length;
  
  // Use rank from API if available
  if (rawNFT.rank) {
    if (rawNFT.rank <= 10) return 'Mythic';
    if (rawNFT.rank <= 50) return 'Legendary';
    if (rawNFT.rank <= 200) return 'Epic';
    if (rawNFT.rank <= 800) return 'Rare';
  }
  
  // Use score from API if available
  if (rawNFT.score) {
    if (rawNFT.score >= 60) return 'Mythic';
    if (rawNFT.score >= 40) return 'Legendary';
    if (rawNFT.score >= 30) return 'Epic';
    if (rawNFT.score >= 20) return 'Rare';
  }
  
  // Fallback to performance count
  if (performanceCount >= 5) return 'Mythic';
  if (performanceCount >= 3) return 'Legendary';
  if (performanceCount >= 2) return 'Epic';
  if (performanceCount >= 1) return 'Rare';
  
  return 'Common';
};

/**
 * Extract image URL from NFT data
 */
const extractImageUrl = (nft: MultiversXNFT): string | undefined => {
  // Prefer media thumbnailUrl for better performance
  if (nft.media && nft.media.length > 0 && nft.media[0].thumbnailUrl) {
    return nft.media[0].thumbnailUrl;
  }
  
  // Fallback to main media URL
  if (nft.media && nft.media.length > 0 && nft.media[0].url) {
    return nft.media[0].url;
  }
  
  // Fallback to url field
  if (nft.url) {
    return nft.url;
  }
  
  return undefined;
};

/**
 * Attempt to recover metadata from IPFS when API parsing fails
 */
const tryRecoverMetadataFromIPFS = async (rawNFT: MultiversXNFT): Promise<any | null> => {
  try {
    // Try to get metadata URI from uris array (usually uris[1] is the JSON)
    if (rawNFT.uris && rawNFT.uris.length > 1) {
      const metadataUriBase64 = rawNFT.uris[1];
      const metadataUri = atob(metadataUriBase64);
      
      // Fetch metadata from IPFS
      const response = await fetch(metadataUri, { 
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const metadata = await response.json();
      return metadata;
    }
    
    return null;
  } catch (error) {
    // Silently fail - fallback will be used
    return null;
  }
};

/**
 * Parse raw MultiversX NFT to GalacticX NFT format
 * Exported for use by collection service
 */
export const parseNFT = async (rawNFT: MultiversXNFT, includeErrors: boolean = false): Promise<GalacticXNFT | null> => {
  // Handle NFTs with metadata errors - Try to recover from IPFS
  if (rawNFT.metadata?.error) {
    // Attempt to recover metadata from IPFS
    const recoveredMetadata = await tryRecoverMetadataFromIPFS(rawNFT);
    
    if (recoveredMetadata) {
      // Successfully recovered! Use it instead
      rawNFT.metadata = recoveredMetadata;
      // Continue with normal parsing below
    } else {
      // Recovery failed, use fallback
      if (!includeErrors) {
        return null; // Will be filtered out
      }
      
      // Try to get real player name even for error NFTs
      const realPlayerName = getRealPlayerName({
        identifier: rawNFT.identifier,
        nonce: rawNFT.nonce,
        name: rawNFT.name
      });
      
      // Try to extract image from media/url even if metadata is broken
      const imageUrl = extractImageUrl(rawNFT);
      
      return {
        identifier: rawNFT.identifier,
        collection: rawNFT.collection,
        nonce: rawNFT.nonce,
        name: rawNFT.name || `Main Season #${rawNFT.nonce}`,
        realPlayerName: realPlayerName || undefined,
        owner: rawNFT.owner || '',
        imageUrl: imageUrl,
        attributes: {},
        rarity: 'Common' as const,
        position: 'Unknown',
        score: rawNFT.score,
        rank: rawNFT.rank
      };
    }
  }
  
  const attributes = parseNFTAttributes(rawNFT.metadata);
  const position = (attributes.position as string) || (attributes.special_perk as string) || 'Unknown';
  const rarity = determineRarity(attributes, rawNFT);
  const imageUrl = extractImageUrl(rawNFT);
  
  // Get real player name from playersData.json
  const realPlayerName = getRealPlayerName({
    identifier: rawNFT.identifier,
    nonce: rawNFT.nonce,
    name: rawNFT.name
  });
  
  return {
    identifier: rawNFT.identifier,
    collection: rawNFT.collection,
    nonce: rawNFT.nonce,
    name: rawNFT.name || `Main Season #${rawNFT.nonce}`,
    realPlayerName: realPlayerName || undefined,
    owner: rawNFT.owner || '',
    imageUrl,
    attributes,
    rarity,
    position,
    score: rawNFT.score,
    rank: rawNFT.rank
  };
};

/**
 * Fetch NFTs for a given wallet address from MultiversX API
 */
export const fetchUserNFTs = async (
  walletAddress: string,
  includeErrors: boolean = false
): Promise<NFTOwnershipResult> => {
  try {
    const response = await axios.get<MultiversXNFT[]>(
      `${API_BASE_URL}/accounts/${walletAddress}/nfts`,
      {
        params: {
          search: GALACTIC_COLLECTION_ID,
          size: 500 // Max NFTs to fetch
        },
        timeout: 15000, // 15 seconds timeout
        headers: {
          'accept': 'application/json'
        }
      }
    );
    
    const rawNFTs = response.data;
    
    // Parse NFTs and filter out any with errors (now async for IPFS recovery)
    const parsedNFTsPromises = rawNFTs.map(nft => parseNFT(nft, includeErrors));
    const parsedNFTsResults = await Promise.all(parsedNFTsPromises);
    const parsedNFTs = parsedNFTsResults.filter(nft => nft !== null);
    
    // Log summary only
    console.log(`✅ Fetched ${parsedNFTs.length} NFTs for ${walletAddress.substring(0, 10)}...`);
    
    return {
      hasNFTs: parsedNFTs.length > 0,
      nftCount: parsedNFTs.length,
      nfts: parsedNFTs,
      lastSynced: new Date()
    };
  } catch (error) {
    console.error('Error fetching NFTs from MultiversX API:', error);
    
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch NFTs. Please check your connection and try again.'
      );
    }
    
    throw new Error('An unexpected error occurred while fetching NFTs.');
  }
};

/**
 * Get NFT details by identifier
 */
export const fetchNFTDetails = async (identifier: string): Promise<GalacticXNFT> => {
  try {
    const response = await axios.get<MultiversXNFT>(
      `${API_BASE_URL}/nfts/${identifier}`,
      {
        timeout: 10000,
        headers: {
          'accept': 'application/json'
        }
      }
    );
    
    const parsed = await parseNFT(response.data, true);
    if (!parsed) {
      throw new Error('Failed to parse NFT data');
    }
    return parsed;
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    throw new Error('Failed to fetch NFT details.');
  }
};

export const nftService = {
  fetchUserNFTs,
  fetchNFTDetails
};

