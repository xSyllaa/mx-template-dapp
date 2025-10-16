# MyNFTs Feature

Collection NFT display feature for GalacticX dApp.

## Quick Start

```typescript
import { useMyNFTs, NFTCard } from 'features/myNFTs';

const MyComponent = () => {
  const { nfts, loading, error } = useMyNFTs();
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {nfts.map(nft => (
        <NFTCard key={nft.identifier} nft={nft} />
      ))}
    </div>
  );
};
```

## Exports

### Hooks
- `useMyNFTs()` - Fetch and manage NFTs

### Components
- `NFTCard` - Display individual NFT

### Services
- `nftService` - MultiversX API integration

### Types
- `GalacticXNFT` - Parsed NFT data
- `MultiversXNFT` - Raw API response
- `NFTAttributes` - NFT metadata
- `NFTOwnershipResult` - Ownership info

## Collection ID

`MAINSEASON-3db9f8`

## Documentation

See [MYNFTS_FEATURE.md](../../../docs/MYNFTS_FEATURE.md) for full documentation.

