/**
 * NFTs API
 * Handles NFT collection info, user NFTs, and NFT details
 */

import { apiClient } from './client';

interface NFTCollection {
  collection: string;
  name: string;
  ticker: string;
  owner: string;
  timestamp: number;
  canFreeze: boolean;
  canWipe: boolean;
  canPause: boolean;
  canTransferNFTCreateRole: boolean;
  nfts: number;
  holders: number;
}

interface NFT {
  identifier: string;
  collection: string;
  timestamp: number;
  attributes: string;
  nonce: number;
  type: string;
  name: string;
  creator: string;
  royalties: number;
  uris: string[];
  url: string;
  media?: any[];
  isWhitelistedStorage?: boolean;
  thumbnailUrl?: string;
  tags?: string[];
  metadata?: any;
  owner?: string;
  balance?: string;
  supply?: string;
  decimals?: number;
  assets?: any;
  ticker?: string;
  score?: number;
  rank?: number;
  scamInfo?: any;
  isNsfw?: boolean;
}

interface NFTHolder {
  address: string;
  balance: string;
}

interface GetCollectionResponse {
  success: boolean;
  collection: NFTCollection;
}

interface GetUserNFTsResponse {
  success: boolean;
  nfts: NFT[];
  total: number;
  hasMore: boolean;
}

interface GetNFTDetailsResponse {
  success: boolean;
  nft: NFT;
  holders: NFTHolder[];
}

interface GetNFTHoldersResponse {
  success: boolean;
  holders: NFTHolder[];
  total: number;
  hasMore: boolean;
}

export const nftsAPI = {
  /**
   * Get GalacticX collection information
   */
  async getCollectionInfo(): Promise<GetCollectionResponse> {
    return apiClient<GetCollectionResponse>('/nfts/collection');
  },

  /**
   * Get NFTs owned by a specific wallet
   * @param walletAddress - User's wallet address
   * @param withMetadata - Whether to include metadata
   * @param size - Number of NFTs to return
   * @param from - Pagination offset
   */
  async getUserNFTs(
    walletAddress: string,
    withMetadata = false,
    size = 50,
    from = 0
  ): Promise<GetUserNFTsResponse> {
    return apiClient<GetUserNFTsResponse>(
      `/nfts/user?walletAddress=${walletAddress}&withMetadata=${withMetadata}&size=${size}&from=${from}`
    );
  },

  /**
   * Get details for a specific NFT
   * @param identifier - NFT identifier (e.g., "COLLECTION-123abc-01")
   */
  async getNFTDetails(identifier: string): Promise<GetNFTDetailsResponse> {
    return apiClient<GetNFTDetailsResponse>(`/nfts/${identifier}`);
  },

  /**
   * Get holders of a specific NFT
   * @param identifier - NFT identifier
   * @param size - Number of holders to return
   * @param from - Pagination offset
   */
  async getNFTHolders(
    identifier: string,
    size = 100,
    from = 0
  ): Promise<GetNFTHoldersResponse> {
    return apiClient<GetNFTHoldersResponse>(
      `/nfts/holders/${identifier}?size=${size}&from=${from}`
    );
  },
};

