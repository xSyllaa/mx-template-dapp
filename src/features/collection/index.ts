/**
 * Collection Feature - Public API
 * 
 * Centralized NFT collection data management with TanStack Query caching.
 * This feature provides:
 * - Collection-level data (info, count, all NFTs)
 * - Derived data (user NFTs, NFTs by identifiers)
 * - UI components for collection display
 */

// Hooks
export {
  useCollectionInfo,
  useCollectionNFTCount,
  useCollectionNFTs,
  useRefreshCollection,
  useCollectionPagination,
  useUserNFTs,
  useNFTsByIdentifiers,
  useUserOwnedNFTs,
  useRefreshUserNFTs,
  useCurrentUserNFTs,
  useInjectTestNFTs,
  collectionKeys,
  userNFTsKeys,
  currentUserNFTsKeys
} from './hooks';

// Components
export {
  CollectionStats,
  CollectionFilters,
  CollectionGrid,
  CollectionSkeleton
} from './components';

// Types
export type {
  CollectionInfo,
  CollectionStats as CollectionStatsType,
  GalacticXNFT
} from './types';

// Services (for advanced usage)
export { collectionService } from './services/collectionService';

