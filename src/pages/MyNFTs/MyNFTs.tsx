import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetAccount } from 'lib/sdkDapp';
import { useMyNFTs, NFTCard, NFTStats, RaritySelect, NFTDetailModal } from 'features/myNFTs';
import type { GalacticXNFT } from 'features/myNFTs';
import { Button } from 'components/Button';

type FilterOption = 'all' | 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export const MyNFTs = () => {
  const { t } = useTranslation();
  const { address } = useGetAccount();
  const { nfts, nftCount, hasNFTs, loading, error, lastSynced, refetch, fetchNFTsForAddress } = useMyNFTs();
  
  const [filterRarity, setFilterRarity] = useState<FilterOption>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [testAddress, setTestAddress] = useState('');
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
  
  // Filter NFTs by rarity
  const filteredNFTs = filterRarity === 'all' 
    ? nfts 
    : nfts.filter(nft => nft.rarity === filterRarity);
  
  // Count by rarity for dropdown
  const rarityCounts: Record<FilterOption, number> = {
    all: nfts.length,
    Common: nfts.filter(n => n.rarity === 'Common').length,
    Rare: nfts.filter(n => n.rarity === 'Rare').length,
    Epic: nfts.filter(n => n.rarity === 'Epic').length,
    Legendary: nfts.filter(n => n.rarity === 'Legendary').length,
    Mythic: nfts.filter(n => n.rarity === 'Mythic').length
  };
  
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
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--mvx-text-primary)] mb-4 bg-gradient-to-r from-[var(--mvx-text-primary)] to-[var(--mvx-text-accent)] bg-clip-text">
          🖼️ {t('pages.myNFTs.title')}
        </h1>
        <p className="text-lg text-[var(--mvx-text-secondary)]">
          {t('pages.myNFTs.subtitle')}
        </p>
      </div>
      
      {/* Test Address Input (for development) */}
      <div className="mb-6">
        <button
          onClick={() => setShowTestInput(!showTestInput)}
          className="text-sm text-[var(--mvx-text-secondary)] hover:text-[var(--mvx-text-primary)] underline mb-2"
        >
          {showTestInput ? t('pages.myNFTs.testMode.hide') : t('pages.myNFTs.testMode.show')}
        </button>
        
        {showTestInput && (
          <div className="flex gap-2 p-4 rounded-lg bg-[var(--mvx-bg-secondary)] border border-[var(--mvx-border)]">
            <input
              type="text"
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              placeholder={t('pages.myNFTs.testMode.placeholder')}
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--mvx-bg-primary)] text-[var(--mvx-text-primary)] border border-[var(--mvx-border)] focus:outline-none focus:ring-2 focus:ring-[var(--mvx-text-accent)]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && testAddress.trim() && !loading) {
                  handleTestAddressSearch();
                }
              }}
            />
            <button
              onClick={handleTestAddressSearch}
              disabled={!testAddress.trim() || loading}
              className="px-4 py-2 rounded-lg bg-[var(--mvx-bg-accent)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {t('pages.myNFTs.testMode.search')}
            </button>
          </div>
        )}
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="animate-spin inline-block w-16 h-16 border-4 border-[var(--mvx-border)] border-t-[var(--mvx-text-accent)] rounded-full mb-4"></div>
          <p className="text-[var(--mvx-text-secondary)] text-lg">
            {t('common.loading')}
          </p>
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-2xl mb-4 text-[var(--mvx-text-primary)] font-bold">{t('pages.myNFTs.error.title')}</p>
          <p className="text-sm mb-6 text-[var(--mvx-text-secondary)]">{error.message}</p>
          <Button onClick={refetch}>
            🔄 {t('pages.myNFTs.error.retry')}
          </Button>
        </div>
      )}
      
      {/* Not Connected State */}
      {!address && !loading && (
        <div className="text-center py-16">
          <div className="text-8xl mb-6">🔒</div>
          <p className="text-2xl text-[var(--mvx-text-primary)] mb-2 font-bold">
            {t('pages.myNFTs.notConnected.title')}
          </p>
          <p className="text-md text-[var(--mvx-text-secondary)]">
            {t('pages.myNFTs.notConnected.subtitle')}
          </p>
        </div>
      )}
      
      {/* No NFTs State */}
      {address && !loading && !error && !hasNFTs && (
        <div className="text-center py-16">
          <div className="text-8xl mb-6">📭</div>
          <p className="text-2xl text-[var(--mvx-text-primary)] mb-2 font-bold">
            {t('pages.myNFTs.empty.title')}
          </p>
          <p className="text-md text-[var(--mvx-text-secondary)]">
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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            {/* Rarity Filter */}
            <RaritySelect
              value={filterRarity}
              onChange={setFilterRarity}
              counts={rarityCounts}
              labels={filterLabels}
            />
            
            {/* Refresh Button */}
            <button
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--mvx-bg-accent)] to-[var(--mvx-text-accent)] text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
              onClick={refetch}
            >
              <span className="text-lg">🔄</span>
              <span>{t('pages.myNFTs.refresh')}</span>
            </button>
          </div>
          
          {/* NFT Grid */}
          {filteredNFTs.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredNFTs.map((nft) => (
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
              <p className="text-xl text-[var(--mvx-text-secondary)]">
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

