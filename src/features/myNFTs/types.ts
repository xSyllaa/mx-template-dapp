// NFT Types for GalacticX Collection

/**
 * MultiversX NFT raw response from API
 */
export interface MultiversXNFT {
  identifier: string;
  collection: string;
  hash?: string;
  attributes?: string;
  nonce: number;
  type: string;
  subType?: string;
  name: string;
  creator?: string;
  royalties?: number;
  owner?: string;
  url?: string;
  uris?: string[];
  media?: Array<{
    url: string;
    originalUrl: string;
    thumbnailUrl: string;
    fileType: string;
    fileSize: number;
  }>;
  isWhitelistedStorage?: boolean;
  tags?: string[];
  metadata?: {
    id?: number;
    name?: string;
    description?: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
    error?: {
      code: string;
      message: string;
      timestamp: number;
    };
  };
  balance?: string;
  ticker?: string;
  score?: number;
  rank?: number;
  isNsfw?: boolean;
}

/**
 * Decoded NFT attributes from metadata
 * Based on trait_type values from the API
 */
export interface NFTAttributes {
  // Player attributes
  name?: string;
  number?: number;
  position?: string;
  nationality?: string;
  
  // Special perks (for non-player cards)
  special_perk?: string; // Team Emblem, Stadium, Manager, Champions L. Card, Europa L.Card
  
  // League info
  league?: string;
  capacity?: string; // For stadiums
  
  // Performance attributes (up to 12)
  performance_1?: string;
  performance_2?: string;
  performance_3?: string;
  performance_4?: string;
  performance_5?: string;
  performance_6?: string;
  performance_7?: string;
  performance_8?: string;
  performance_9?: string;
  performance_10?: string;
  performance_11?: string;
  performance_12?: string;
  
  // Any other dynamic attributes
  [key: string]: string | number | undefined;
}

/**
 * Parsed GalacticX NFT with decoded metadata
 */
export interface GalacticXNFT {
  identifier: string;
  collection: string;
  nonce: number;
  name: string;
  owner: string;
  imageUrl?: string;
  attributes: NFTAttributes;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  position: string;
  score?: number;
  rank?: number;
}

/**
 * NFT ownership verification result
 */
export interface NFTOwnershipResult {
  hasNFTs: boolean;
  nftCount: number;
  nfts: GalacticXNFT[];
  lastSynced: Date;
}

/**
 * NFT service error
 */
export interface NFTServiceError {
  message: string;
  code?: string;
  details?: unknown;
}

