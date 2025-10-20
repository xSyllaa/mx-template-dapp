import { useState, useEffect } from 'react';

export interface NFTMedia {
  url: string;
  originalUrl: string;
  thumbnailUrl: string;
  fileType: string;
  fileSize: number;
}

export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTMetadata {
  id: number;
  name: string;
  description: string;
  attributes: NFTAttribute[];
}

export interface NFTDetails {
  identifier: string;
  collection: string;
  nonce: number;
  name: string;
  type: string;
  url: string;
  media: NFTMedia[];
  tags: string[];
  metadata: NFTMetadata;
  owner: string;
  ticker: string;
  isNsfw: boolean;
}

export interface UseNFTDetailsReturn {
  nftDetails: NFTDetails | null;
  loading: boolean;
  error: Error | null;
}

// Cache global pour stocker les détails des NFTs
const nftDetailsCache = new Map<string, NFTDetails>();

export const useNFTDetails = (nftId: string | null): UseNFTDetailsReturn => {
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!nftId) {
      setNftDetails(null);
      return;
    }

    // Vérifier le cache d'abord
    if (nftDetailsCache.has(nftId)) {
      setNftDetails(nftDetailsCache.get(nftId)!);
      return;
    }

    const fetchNFTDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.multiversx.com/nfts/${nftId}`,
          {
            headers: {
              'accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch NFT details: ${response.statusText}`);
        }

        const data: NFTDetails = await response.json();
        
        // Stocker dans le cache
        nftDetailsCache.set(nftId, data);
        
        setNftDetails(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        console.error('Error fetching NFT details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTDetails();
  }, [nftId]);

  return { nftDetails, loading, error };
};

// Hook pour récupérer plusieurs NFTs en batch
export const useBatchNFTDetails = (nftIds: string[]) => {
  const [nftDetailsMap, setNftDetailsMap] = useState<Map<string, NFTDetails>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const fetchBatchDetails = async () => {
    if (nftIds.length === 0) return;

    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: nftIds.length });

    try {
      const detailsMap = new Map<string, NFTDetails>();
      
      // Récupérer les détails pour chaque NFT
      const promises = nftIds.map(async (nftId, index) => {
        // Vérifier le cache d'abord
        if (nftDetailsCache.has(nftId)) {
          detailsMap.set(nftId, nftDetailsCache.get(nftId)!);
          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
          return;
        }

        try {
          const response = await fetch(
            `https://api.multiversx.com/nfts/${nftId}`,
            {
              headers: {
                'accept': 'application/json'
              }
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch NFT ${nftId}: ${response.statusText}`);
          }

          const data: NFTDetails = await response.json();
          
          // Stocker dans le cache
          nftDetailsCache.set(nftId, data);
          detailsMap.set(nftId, data);
          
          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        } catch (err) {
          console.error(`Error fetching NFT ${nftId}:`, err);
        }
      });

      await Promise.all(promises);
      setNftDetailsMap(detailsMap);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Error fetching batch NFT details:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    nftDetailsMap,
    loading,
    error,
    progress,
    fetchBatchDetails
  };
};

