# NFT Cache Architecture - TanStack Query

## 📋 Overview

This document explains the centralized NFT caching system implemented with TanStack Query to manage the GalacticX NFT collection data efficiently.

## 🎯 Goals

- **Single Source of Truth**: All NFT data comes from one cached collection
- **Performance**: Load collection once, filter client-side for instant access
- **Reduced API Calls**: From hundreds of individual requests to ~23 batched calls
- **Better UX**: Instant page transitions after initial load
- **Maintainability**: One place to update NFT fetching logic

## 🏗 Architecture

### TanStack Query Setup

**File**: `src/lib/queryClient.ts`

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour
      gcTime: 1000 * 60 * 60 * 2, // 2 hours
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

**Wrapped in**: `src/App.tsx` with `QueryClientProvider`

### Core Services

**File**: `src/features/collection/services/collectionService.ts`

Three main API functions:
1. `fetchCollectionInfo()` - Collection metadata
2. `fetchCollectionNFTCount()` - Total NFT count
3. `fetchAllCollectionNFTs()` - All NFTs in single request (size=totalCount, max 10000)

**Performance Note**: Single API call with `size=totalCount` instead of multiple batches for faster loading.

### Core Hooks

**File**: `src/features/collection/hooks/useCollectionData.ts`

- `useCollectionInfo()` - Collection metadata
- `useCollectionNFTCount()` - Total count
- `useCollectionNFTs()` - All NFTs (main data source)
- `useRefreshCollection()` - Manual cache invalidation

## 🔧 Derived Hooks

These hooks filter from the cached collection:

### useUserNFTs(walletAddress)

**File**: `src/features/collection/hooks/useUserNFTs.ts`

Filters NFTs by owner address. Replaces individual `/accounts/{address}/nfts` API calls.

```typescript
const { nfts, hasNFTs, loading } = useUserNFTs(address);
```

**Returns**:
- `nfts`: Array of user's NFTs
- `nftCount`: Total count
- `hasNFTs`: Boolean
- `loading`: Boolean
- `error`: Error | null
- `lastSynced`: Date | null
- `refetch`: Function

**Used in**:
- `src/pages/MyNFTs/MyNFTs.tsx`
- `src/pages/WarGames/WarGames.tsx`

### useNFTsByIdentifiers(identifiers)

**File**: `src/features/collection/hooks/useNFTsByIdentifiers.ts`

Filters NFTs by array of identifiers. Replaces individual `/nfts/{identifier}` API calls.

```typescript
const { nfts, nftMap, loading } = useNFTsByIdentifiers(['MAINSEASON-3db9f8-01', 'MAINSEASON-3db9f8-02']);
```

**Returns**:
- `nfts`: Array of matched NFTs
- `nftMap`: Map<identifier, NFT> for quick lookup
- `loading`: Boolean
- `error`: Error | null
- `allFound`: Boolean (all identifiers found)
- `missingIdentifiers`: Array of not found identifiers

**Used in**:
- `src/pages/TeamOfWeek/TeamOfWeek.tsx`

## 📊 Data Flow

```
┌─────────────────────────────────────┐
│   MultiversX API                    │
│   /collections/MAINSEASON-3db9f8    │
└─────────┬───────────────────────────┘
          │
          │ fetchAllCollectionNFTs()
          │ (1 API call with size=2227)
          ↓
┌─────────────────────────────────────┐
│   TanStack Query Cache              │
│   queryKey: ['collection', 'nfts']  │
│   staleTime: 1 hour                 │
│   ~2227 NFTs                        │
└─────────┬───────────────────────────┘
          │
          ├──→ useUserNFTs(address)
          │     Filter by owner
          │     → My NFTs Page
          │     → War Games Page
          │
          ├──→ useNFTsByIdentifiers([ids])
          │     Filter by identifiers
          │     → Team of Week Page
          │
          └──→ useCollectionNFTs()
                Full collection
                → Collection Page
```

## 🎨 UI Components

### Collection Page

**File**: `src/pages/Collection/Collection.tsx`

Authenticated page showing the entire collection with:
- Collection stats (rarity distribution, position distribution)
- Filters (rarity, position, nationality)
- Search functionality
- Refresh button

**Components**:
- `CollectionStats` - Statistics dashboard
- `CollectionFilters` - Filter controls
- `CollectionGrid` - NFT grid display

## 🔄 Migration Guide

### Before (Old System)

```typescript
// My NFTs Page
import { useMyNFTs } from 'features/myNFTs';
const { nfts, loading } = useMyNFTs();

// Team of Week Page
const loadNFTDetails = async (nftIds: string[]) => {
  const promises = nftIds.map(id => fetch(`/nfts/${id}`));
  await Promise.all(promises);
};
```

### After (New System)

```typescript
// My NFTs Page
import { useUserNFTs } from 'features/collection';
const { nfts, loading } = useUserNFTs(address);

// Team of Week Page
import { useNFTsByIdentifiers } from 'features/collection';
const { nftMap } = useNFTsByIdentifiers(nftIds);
```

## 🚀 Performance Improvements

| Feature | Before | After | Improvement |
|---------|--------|-------|-------------|
| My NFTs (100 NFTs) | 100 API calls | 0 (uses cache) | 100% reduction |
| Team of Week (11 NFTs) | 11 API calls | 0 (uses cache) | 100% reduction |
| War Games | 1 API call per user | 0 (uses cache) | 100% reduction |
| Collection Overview | N/A | 1 API call (once) | New feature |
| Initial Load | ~200-500 calls/session | 1-2 calls/session | ~99% reduction |

## 🎯 Cache Strategy

### Cache Duration
- **staleTime**: 1 hour - Data considered fresh for 1 hour
- **gcTime**: 2 hours - Data kept in memory for 2 hours after last use

### Manual Refresh
Users can manually refresh via:
```typescript
const refreshCollection = useRefreshCollection();
await refreshCollection(); // Invalidates all collection queries
```

Refresh button available in:
- Collection page
- My NFTs page (via refetch)

### Automatic Refresh
- On reconnection (network comes back)
- Not on window focus (avoid unnecessary refetch)
- Not on mount if data is fresh

## 📝 Adding New Features

To use collection data in a new feature:

```typescript
import { useCollectionNFTs } from 'features/collection';

export const MyNewFeature = () => {
  const { data: allNFTs, isLoading } = useCollectionNFTs();
  
  // Filter client-side
  const filteredNFTs = useMemo(() => {
    return allNFTs?.filter(nft => /* your logic */);
  }, [allNFTs]);
  
  // Use filteredNFTs
};
```

Or create a custom hook in `src/features/collection/hooks/`:

```typescript
export const useTopRatedNFTs = (limit: number = 10) => {
  const { data: allNFTs, isLoading } = useCollectionNFTs();
  
  const topNFTs = useMemo(() => {
    return allNFTs
      ?.sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);
  }, [allNFTs, limit]);
  
  return { nfts: topNFTs, loading: isLoading };
};
```

## 🐛 Troubleshooting

### Cache not updating
```typescript
import { useQueryClient } from '@tanstack/react-query';
import { collectionKeys } from 'features/collection';

const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: collectionKeys.nfts });
```

### Missing NFTs
Check console for:
- "Skipping NFT X - metadata error" - NFT has invalid metadata
- API rate limiting - reduce batch size in `collectionService.ts`

### Performance issues
- Check if data is being refetched unnecessarily (devtools)
- Verify memoization in filtering logic
- Check network tab for duplicate requests

## 📚 Related Files

- `src/lib/queryClient.ts` - Query client config
- `src/App.tsx` - Query provider setup
- `src/features/collection/` - Collection feature
  - `services/collectionService.ts` - API calls
  - `hooks/useCollectionData.ts` - Core hooks
  - `hooks/useUserNFTs.ts` - User filtering
  - `hooks/useNFTsByIdentifiers.ts` - Identifier filtering
  - `components/` - UI components
- `src/pages/Collection/` - Collection overview page
- `src/pages/MyNFTs/MyNFTs.tsx` - Migrated
- `src/pages/WarGames/WarGames.tsx` - Migrated
- `src/pages/TeamOfWeek/TeamOfWeek.tsx` - Migrated

## 🎓 Best Practices

1. **Always use the cache** - Don't make direct API calls for NFT data
2. **Filter client-side** - The collection is cached, filtering is fast
3. **Use memoization** - Wrap expensive filters in `useMemo`
4. **Keep hooks simple** - Extract complex logic to utilities
5. **Log performance** - Use console.time for slow operations
6. **Handle loading states** - Always show loading/error/empty states

## 🔗 External Resources

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [MultiversX API](https://api.multiversx.com/docs)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)

---

**Last Updated**: 2025-10-21
**Version**: 1.0
**Author**: GalacticX Team

