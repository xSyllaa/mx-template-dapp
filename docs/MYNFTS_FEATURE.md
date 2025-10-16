# My NFTs Feature Documentation

## 📋 Overview

The **My NFTs** feature allows users to view and manage their GalacticX NFT collection from the MAINSEASON-3db9f8 collection on MultiversX blockchain.

## 🏗 Architecture

### Feature Structure

```
src/features/myNFTs/
├── types.ts                    # TypeScript type definitions
├── services/
│   └── nftService.ts          # MultiversX API integration
├── hooks/
│   └── useMyNFTs.ts           # Custom React hook
├── components/
│   └── NFTCard.tsx            # NFT display component
└── index.ts                    # Public API exports
```

### Pages

```
src/pages/MyNFTs/
├── MyNFTs.tsx                 # Main page component
└── index.ts
```

## 🔧 Components

### 1. NFT Service (`nftService.ts`)

**Purpose**: Fetches NFT data from MultiversX API

**Key Functions**:
- `fetchUserNFTs(walletAddress: string)` - Fetches all NFTs for a wallet address
- `fetchNFTDetails(identifier: string)` - Fetches details for a specific NFT

**API Integration**:
```typescript
// Base URL selection based on network
Mainnet: https://api.multiversx.com
Devnet:  https://devnet-api.multiversx.com
Testnet: https://testnet-api.multiversx.com

// Endpoint
GET /accounts/{address}/nfts?collections=MAINSEASON-3db9f8&size=100
```

**Metadata Parsing**:
- Decodes base64-encoded attributes
- Extracts player stats (pace, shooting, passing, etc.)
- Determines rarity based on overall rating or attributes
- Converts IPFS URLs to HTTP gateway URLs

### 2. Custom Hook (`useMyNFTs.ts`)

**Purpose**: Manages NFT state and fetching logic

**Returns**:
```typescript
{
  nfts: GalacticXNFT[];           // Array of parsed NFTs
  nftCount: number;                // Total NFT count
  hasNFTs: boolean;                // Whether user owns NFTs
  loading: boolean;                // Loading state
  error: Error | null;             // Error state
  lastSynced: Date | null;         // Last sync timestamp
  refetch: () => Promise<void>;    // Manual refetch function
}
```

**Features**:
- Auto-fetches on wallet connection
- Handles loading/error states
- Provides manual refetch capability
- Resets state when wallet disconnects

### 3. NFT Card Component (`NFTCard.tsx`)

**Purpose**: Displays individual NFT information

**Features**:
- Responsive design (mobile-first)
- Rarity-based color scheme:
  - **Mythic**: Red gradient
  - **Legendary**: Yellow gradient
  - **Epic**: Purple gradient
  - **Rare**: Blue gradient
  - **Common**: Gray gradient
- Hover animations
- Displays:
  - NFT image (IPFS)
  - Player name
  - Position
  - Rarity
  - Overall rating (if available)
  - NFT nonce

### 4. My NFTs Page (`MyNFTs.tsx`)

**Purpose**: Main page for viewing NFT collection

**Features**:

#### Stats Bar
- Total NFTs owned
- Collection name (MAINSEASON)
- Last sync time

#### Rarity Filter Dropdown
- Filter by rarity (All, Mythic, Legendary, Epic, Rare, Common)
- Shows count for each rarity
- Smooth dropdown animation

#### States
- **Loading**: Spinner animation
- **Error**: Error message with retry button
- **Not Connected**: Prompt to connect wallet
- **Empty**: No NFTs found message
- **Success**: Grid display of NFT cards

#### Grid Layout
- Responsive grid:
  - Mobile: 1 column
  - xs (480px): 2 columns
  - sm (640px): 3 columns
  - md (768px): 4 columns
  - lg (1024px+): 5 columns

## 🎨 Styling

### Theme Support

All components support 3 themes:
- `mvx:dark-theme` (Dark)
- `mvx:light-theme` (Light)
- `mvx:vibe-theme` (Vibe)

Uses CSS variables for theming:
```css
--mvx-bg-primary
--mvx-bg-secondary
--mvx-bg-tertiary
--mvx-bg-accent
--mvx-text-primary
--mvx-text-secondary
--mvx-text-tertiary
--mvx-border
```

## 🌍 Internationalization (i18n)

### Translation Keys

**English** (`en.json`):
```json
"pages.myNFTs": {
  "title": "My NFTs",
  "subtitle": "View and manage your GalacticX NFT collection",
  "stats": {
    "totalNFTs": "Total NFTs",
    "collection": "Collection",
    "lastSynced": "Last Synced"
  },
  "filters": {
    "all": "All Rarities",
    "common": "Common",
    "rare": "Rare",
    "epic": "Epic",
    "legendary": "Legendary",
    "mythic": "Mythic"
  },
  "error": {
    "title": "Failed to load NFTs",
    "retry": "Retry"
  },
  "notConnected": {
    "title": "Wallet not connected",
    "subtitle": "Please connect your wallet to view your NFTs"
  },
  "empty": {
    "title": "No NFTs found",
    "subtitle": "You don't own any GalacticX NFTs yet"
  },
  "noResults": "No NFTs match this filter",
  "refresh": "Refresh"
}
```

**French** (`fr.json`):
- Complete translation available
- Fallback to English if key missing

## 🔄 Data Flow

```
1. User connects wallet
   ↓
2. useMyNFTs hook detects address
   ↓
3. fetchUserNFTs(address) called
   ↓
4. MultiversX API request
   ↓
5. Parse & decode NFT metadata
   ↓
6. Update React state
   ↓
7. Re-render with NFT cards
```

## 🚀 Usage Example

```typescript
import { useMyNFTs, NFTCard } from 'features/myNFTs';

const MyComponent = () => {
  const { nfts, loading, error, refetch } = useMyNFTs();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <button onClick={refetch}>Refresh NFTs</button>
      <div className="grid">
        {nfts.map(nft => (
          <NFTCard key={nft.identifier} nft={nft} />
        ))}
      </div>
    </div>
  );
};
```

## 🛡 Security Considerations

1. **No Private Key Storage**: Never stores wallet private keys
2. **Read-Only API**: Only reads NFT data, no write operations
3. **Client-Side Only**: No sensitive data sent to backend
4. **HTTPS**: All API calls use HTTPS
5. **Timeout Protection**: 10-second timeout on API requests

## 🐛 Error Handling

### API Errors
```typescript
try {
  await fetchUserNFTs(address);
} catch (error) {
  // User-friendly error message
  // Console error for debugging
  // Update error state
}
```

### Network Issues
- Timeout after 10 seconds
- Retry button provided
- Error message displayed to user

### Empty States
- Not connected: Prompt to connect wallet
- No NFTs: Friendly message explaining
- No filter results: Option to clear filter

## 📊 Performance

### Optimizations
- **Lazy loading**: Images loaded on-demand
- **Memoization**: Filter calculations memoized
- **Debouncing**: API calls debounced
- **Pagination**: Fetches max 100 NFTs (API limit)

### Caching
- NFT data cached in React state
- Manual refresh available
- Auto-refresh on wallet change

## 🧪 Testing

### Test Cases
1. ✅ Fetch NFTs for connected wallet
2. ✅ Display loading state
3. ✅ Handle API errors gracefully
4. ✅ Filter by rarity
5. ✅ Display empty state when no NFTs
6. ✅ Refetch on manual refresh
7. ✅ Theme switching works correctly
8. ✅ i18n translations work

### Edge Cases
- No wallet connected
- No NFTs owned
- API timeout
- Invalid NFT metadata
- Missing image URLs

## 📝 Future Enhancements

### Potential Features
- [ ] Search by NFT name
- [ ] Sort by rarity, position, overall rating
- [ ] NFT detail modal/page
- [ ] Export NFT list
- [ ] Share collection link
- [ ] Sync to Supabase for caching
- [ ] Multi-collection support
- [ ] NFT stats comparison
- [ ] Trading/listing integration

## 🔗 Related Documentation

- [MultiversX Integration](./MULTIVERSX_INTEGRATION.md)
- [Component Structure](./COMPONENT_STRUCTURE.md)
- [i18n Setup](./I18N_SETUP.md)
- [Design System](./DESIGN_SYSTEM.md)

## 📞 Support

For issues or questions:
1. Check [API Endpoints](./API_ENDPOINTS.md)
2. Review [Architecture](./ARCHITECTURE.md)
3. Check MultiversX API status
4. Verify wallet connection

---

**Last Updated**: January 2025  
**Version**: 1.0.0

