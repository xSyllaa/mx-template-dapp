import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAccount } from 'lib/sdkDapp';
import { 
  useMyNFTs, 
  NFTCard, 
  NFTStats, 
  RaritySelect, 
  NFTDetailModal,
  PositionSelect,
  NationalitySelect,
  SearchInput
} from 'features/myNFTs';
import type { GalacticXNFT } from 'features/myNFTs';
import { Button } from 'components/Button';

type FilterOption = 'all' | 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export const MyNFTs = () => {
  const { t } = useTranslation();
  const { address } = useGetAccount();
  
  const { nfts, nftCount, hasNFTs, loading, error, lastSynced, refetch, fetchNFTsForAddress } = useMyNFTs();
  
  const [filterRarity, setFilterRarity] = useState<FilterOption>('all');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterNationality, setFilterNationality] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [testAddress, setTestAddress] = useState('erd1z563juvyfl7etnev8ua65vzhx65ln0rp0m783hq2m2wgdxx6z83s9t2cmv');
  const [showTestInput, setShowTestInput] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<GalacticXNFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleTestAddressSearch = async () => {
    if (testAddress.trim()) {
      await fetchNFTsForAddress(testAddress.trim());
    }
  };
  
  const handleNFTClick = (nft: GalacticXNFT) => {
    // Log toutes les infos de l'API
    console.group('🎴 NFT Details - API Data');
    console.log('Full NFT Object:', nft);
    console.log('Identifier:', nft.identifier);
    console.log('Name:', nft.name);
    console.log('Rarity:', nft.rarity);
    console.log('Position:', nft.position);
    console.log('Nonce:', nft.nonce);
    console.log('Image URL:', nft.imageUrl);
    console.log('Collection:', nft.collection);
    console.log('Score:', nft.score);
    console.log('Rank:', nft.rank);
    console.log('Attributes:', nft.attributes);
    console.groupEnd();
    
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing selectedNFT to allow exit animation
    setTimeout(() => setSelectedNFT(null), 300);
  };
  
  // Extract unique positions and nationalities
  const uniquePositions = useMemo(() => {
    const positions = new Set<string>();
    nfts.forEach(nft => {
      if (nft.position) {
        positions.add(nft.position);
      }
    });
    return Array.from(positions).sort();
  }, [nfts]);
  
  const uniqueNationalities = useMemo(() => {
    const nationalities = new Set<string>();
    nfts.forEach(nft => {
      if (nft.attributes.nationality) {
        nationalities.add(nft.attributes.nationality);
      }
    });
    return Array.from(nationalities).sort();
  }, [nfts]);
  
  // Filter NFTs by all criteria
  const filteredNFTs = useMemo(() => {
    return nfts.filter(nft => {
      // Rarity filter
      if (filterRarity !== 'all' && nft.rarity !== filterRarity) {
        return false;
      }
      
      // Position filter
      if (filterPosition !== 'all' && nft.position !== filterPosition) {
        return false;
      }
      
      // Nationality filter
      if (filterNationality !== 'all' && nft.attributes.nationality !== filterNationality) {
        return false;
      }
      
      // Search query - search in all attributes
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        
        // Search in name
        if (nft.name.toLowerCase().includes(query)) {
          return true;
        }
        
        // Search in position
        if (nft.position.toLowerCase().includes(query)) {
          return true;
        }
        
        // Search in all attributes
        for (const [key, value] of Object.entries(nft.attributes)) {
          if (value && String(value).toLowerCase().includes(query)) {
            return true;
          }
        }
        
        return false;
      }
      
      return true;
    });
  }, [nfts, filterRarity, filterPosition, filterNationality, searchQuery]);
  
  // Count by rarity for dropdown
  const rarityCounts: Record<FilterOption, number> = useMemo(() => ({
    all: nfts.length,
    Common: nfts.filter(n => n.rarity === 'Common').length,
    Rare: nfts.filter(n => n.rarity === 'Rare').length,
    Epic: nfts.filter(n => n.rarity === 'Epic').length,
    Legendary: nfts.filter(n => n.rarity === 'Legendary').length,
    Mythic: nfts.filter(n => n.rarity === 'Mythic').length
  }), [nfts]);
  
  // Count by position
  const positionCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = { all: nfts.length };
    uniquePositions.forEach((pos: string) => {
      counts[pos] = nfts.filter(n => n.position === pos).length;
    });
    return counts;
  }, [nfts, uniquePositions]);
  
  // Count by nationality
  const nationalityCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = { all: nfts.length };
    uniqueNationalities.forEach((nat: string) => {
      counts[nat] = nfts.filter(n => n.attributes.nationality === nat).length;
    });
    return counts;
  }, [nfts, uniqueNationalities]);
  
  // Labels for filter options
  const filterLabels: Record<FilterOption, string> = {
    all: t('pages.myNFTs.filters.all'),
    Mythic: t('pages.myNFTs.filters.mythic'),
    Legendary: t('pages.myNFTs.filters.legendary'),
    Epic: t('pages.myNFTs.filters.epic'),
    Rare: t('pages.myNFTs.filters.rare'),
    Common: t('pages.myNFTs.filters.common')
  };
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--mvx-text-color-primary)] to-[var(--mvx-text-accent-color)] bg-clip-text text-transparent">
          🖼️ {t('pages.myNFTs.title')}
        </h1>
        <p className="text-lg text-[var(--mvx-text-color-secondary)]">
          {t('pages.myNFTs.subtitle')}
        </p>
      </div>
      
      {/* Test Address Input (for development) */}
      <div className="mb-6">
        <button
          onClick={() => setShowTestInput(!showTestInput)}
          className="text-sm text-secondary hover:text-primary underline mb-2"
        >
          {showTestInput ? t('pages.myNFTs.testMode.hide') : t('pages.myNFTs.testMode.show')}
        </button>
        
        {showTestInput && (
          <div className="flex gap-2 p-4 rounded-lg bg-secondary border border-secondary">
            <input
              type="text"
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              placeholder={t('pages.myNFTs.testMode.placeholder')}
              className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary border border-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && testAddress.trim() && !loading) {
                  handleTestAddressSearch();
                }
              }}
            />
            <button
              onClick={handleTestAddressSearch}
              disabled={!testAddress.trim() || loading}
              className="px-4 py-2 rounded-lg bg-tertiary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {t('pages.myNFTs.testMode.search')}
            </button>
          </div>
        )}
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="animate-spin inline-block w-16 h-16 border-4 border-secondary border-t-accent rounded-full mb-4"></div>
          <p className="text-secondary text-lg">
            {t('common.loading')}
          </p>
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-2xl mb-4 text-primary font-bold">{t('pages.myNFTs.error.title')}</p>
          <p className="text-sm mb-6 text-secondary">{error.message}</p>
          <Button onClick={refetch}>
            🔄 {t('pages.myNFTs.error.retry')}
          </Button>
        </div>
      )}
      
      {/* Not Connected State */}
      {!address && !loading && (
        <div className="text-center py-16">
          <div className="text-8xl mb-6">🔒</div>
          <p className="text-2xl text-primary mb-2 font-bold">
            {t('pages.myNFTs.notConnected.title')}
          </p>
          <p className="text-md text-secondary">
            {t('pages.myNFTs.notConnected.subtitle')}
          </p>
        </div>
      )}
      
      {/* No NFTs State */}
      {address && !loading && !error && !hasNFTs && (
        <div className="text-center py-16">
          <div className="text-8xl mb-6">📭</div>
          <p className="text-2xl text-primary mb-2 font-bold">
            {t('pages.myNFTs.empty.title')}
          </p>
          <p className="text-md text-secondary">
            {t('pages.myNFTs.empty.subtitle')}
          </p>
        </div>
      )}
      
      {/* NFTs Display */}
      {!loading && !error && hasNFTs && (
        <>
          {/* Stats Section */}
          <NFTStats nfts={nfts} totalCount={nftCount} />
          
          {/* Controls */}
          <div className="space-y-4 mb-8">
            {/* First row: Search input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
              />
              
              {/* Refresh Button - Inline on desktop, below on mobile */}
              <button
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-tertiary to-accent text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap sm:w-auto"
                onClick={refetch}
              >
                <span className="text-lg">🔄</span>
                <span>{t('pages.myNFTs.refresh')}</span>
              </button>
            </div>
            
            {/* Second row: Filter dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Rarity Filter */}
              <RaritySelect
                value={filterRarity}
                onChange={setFilterRarity}
                counts={rarityCounts}
                labels={filterLabels}
              />
              
              {/* Position Filter */}
              {uniquePositions.length > 0 && (
                <PositionSelect
                  value={filterPosition}
                  onChange={setFilterPosition}
                  positions={uniquePositions}
                  counts={positionCounts}
                />
              )}
              
              {/* Nationality Filter */}
              {uniqueNationalities.length > 0 && (
                <NationalitySelect
                  value={filterNationality}
                  onChange={setFilterNationality}
                  nationalities={uniqueNationalities}
                  counts={nationalityCounts}
                />
              )}
            </div>
          </div>
          
          {/* NFT Grid */}
          {filteredNFTs.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredNFTs.map((nft: GalacticXNFT) => (
                <NFTCard 
                  key={nft.identifier} 
                  nft={nft}
                  onClick={handleNFTClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-secondary">
                {t('pages.myNFTs.noResults')}
              </p>
            </div>
          )}
        </>
      )}
      
      {/* NFT Detail Modal */}
      <NFTDetailModal
        nft={selectedNFT}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

