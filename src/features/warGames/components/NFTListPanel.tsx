import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMyNFTs } from 'features/myNFTs';
import { SearchInput, PositionSelect, NationalitySelect } from 'features/myNFTs';
import { VerticalNFTCard } from './VerticalNFTCard';
import { HorizontalNFTCard } from './HorizontalNFTCard';
import { CardDesignToggle, type CardDesign } from './CardDesignToggle';
import type { GalacticXNFT } from 'features/myNFTs';

interface NFTListPanelProps {
  placedNFTs: string[];
  onDragStart: (nft: GalacticXNFT) => void;
  onDragEnd: () => void;
  testAddress?: string;
}

export const NFTListPanel = ({ placedNFTs, onDragStart, onDragEnd, testAddress }: NFTListPanelProps) => {
  const { t } = useTranslation();
  const { nfts, loading, error } = useMyNFTs(testAddress, true);
  
  // Debug logs
  console.log(`🎮 NFTListPanel: NFTs count: ${nfts.length}`);
  console.log(`🎮 NFTListPanel: Loading: ${loading}`);
  console.log(`🎮 NFTListPanel: Error:`, error);
  console.log(`🎮 NFTListPanel: Placed NFTs: ${placedNFTs.length}`);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterNationality, setFilterNationality] = useState<string>('all');
  const [cardDesign, setCardDesign] = useState<CardDesign>('vertical');

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

  // Filter NFTs by all criteria (show all NFTs, not just unplaced ones)
  const filteredNFTs = useMemo(() => {
    return nfts.filter(nft => {
      // Position filter
      if (filterPosition !== 'all' && nft.position !== filterPosition) {
        return false;
      }
      
      // Nationality filter
      if (filterNationality !== 'all' && nft.attributes.nationality !== filterNationality) {
        return false;
      }
      
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        
        if (nft.name.toLowerCase().includes(query)) {
          return true;
        }
        
        if (nft.position.toLowerCase().includes(query)) {
          return true;
        }
        
        for (const [key, value] of Object.entries(nft.attributes)) {
          if (value && String(value).toLowerCase().includes(query)) {
            return true;
          }
        }
        
        return false;
      }
      
      return true;
    });
  }, [nfts, filterPosition, filterNationality, searchQuery]);

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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-secondary border-t-accent rounded-full mb-4"></div>
          <p className="text-sm text-secondary">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-sm text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[var(--mvx-bg-color-secondary)] rounded-lg p-4 min-h-0">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <h3 className="text-lg font-bold text-[var(--mvx-text-color-primary)] mb-2">
          {t('pages.warGames.nftList.title')}
        </h3>
        <p className="text-sm text-[var(--mvx-text-color-secondary)]">
          {t('pages.warGames.nftList.total', { total: nfts.length, placed: placedNFTs.length })}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-4 flex-shrink-0">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
        />
        
        <CardDesignToggle
          design={cardDesign}
          onDesignChange={setCardDesign}
        />
        
        {uniquePositions.length > 0 && (
          <PositionSelect
            value={filterPosition}
            onChange={setFilterPosition}
            positions={uniquePositions}
            counts={positionCounts}
          />
        )}
        
        {uniqueNationalities.length > 0 && (
          <NationalitySelect
            value={filterNationality}
            onChange={setFilterNationality}
            nationalities={uniqueNationalities}
            counts={nationalityCounts}
          />
        )}
      </div>

      {/* NFT List - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredNFTs.length > 0 ? (
          <div className={`${cardDesign === 'vertical' ? 'space-y-3' : 'space-y-2'} pb-4`}>
            {filteredNFTs.map((nft) => {
              const isPlaced = placedNFTs.includes(nft.identifier);
              return (
                <div key={nft.identifier} className="relative">
                  {cardDesign === 'vertical' ? (
                    <VerticalNFTCard
                      nft={nft}
                      isPlaced={isPlaced}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                    />
                  ) : (
                    <HorizontalNFTCard
                      nft={nft}
                      isPlaced={isPlaced}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                    />
                  )}
                  
                  {/* Placed indicator overlay */}
                  {isPlaced && (
                    <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center pointer-events-none">
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {t('common.placed')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-sm text-[var(--mvx-text-color-secondary)]">
              {t('pages.warGames.nftList.noNFTs')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
