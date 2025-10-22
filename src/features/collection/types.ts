/**
 * Collection Feature Types
 */
import type { GalacticXNFT } from 'features/myNFTs';

/**
 * MultiversX Collection Info from API
 */
export interface CollectionInfo {
  collection: string;
  type: string;
  subType?: string;
  name: string;
  ticker: string;
  owner: string;
  timestamp: number;
  canFreeze: boolean;
  canWipe: boolean;
  canPause: boolean;
  canTransferNftCreateRole: boolean;
  canChangeOwner: boolean;
  canUpgrade: boolean;
  canAddSpecialRoles: boolean;
  traits?: string;
  canTransfer?: boolean;
  roles?: Array<{
    address?: string;
    canCreate: boolean;
    canBurn: boolean;
    canAddQuantity: boolean;
    canUpdateAttributes: boolean;
    canAddUri: boolean;
    roles: string[];
  }>;
}

/**
 * Collection statistics computed from NFT data
 */
export interface CollectionStats {
  totalNFTs: number;
  rarityDistribution: {
    Common: number;
    Rare: number;
    Epic: number;
    Legendary: number;
    Mythic: number;
  };
  positionDistribution: Record<string, number>;
  nationalityDistribution: Record<string, number>;
  topNationalities: Array<{
    nationality: string;
    count: number;
  }>;
}

/**
 * Re-export GalacticXNFT for convenience
 */
export type { GalacticXNFT };

