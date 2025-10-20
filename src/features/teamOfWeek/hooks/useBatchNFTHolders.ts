import { useState, useCallback } from 'react';
import type { NFTHolder } from '../types';

export interface UseBatchNFTHoldersReturn {
  fetchBatchHolders: (nftIds: string[]) => Promise<Map<string, NFTHolder[]>>;
  loading: boolean;
  error: string | null;
  progress: { current: number; total: number };
}

/**
 * Hook pour récupérer les détenteurs de plusieurs NFTs en batch
 */
export const useBatchNFTHolders = (): UseBatchNFTHoldersReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const fetchSingleNFTHolders = async (nftId: string): Promise<NFTHolder[]> => {
    const response = await fetch(
      `https://api.multiversx.com/nfts/${nftId}/accounts`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error for ${nftId}: ${response.status} ${response.statusText}`);
    }

    const data: NFTHolder[] = await response.json();
    return data;
  };

  const fetchBatchHolders = useCallback(async (nftIds: string[]): Promise<Map<string, NFTHolder[]>> => {
    if (nftIds.length === 0) {
      return new Map();
    }

    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: nftIds.length });

    const holdersMap = new Map<string, NFTHolder[]>();

    try {
      for (let i = 0; i < nftIds.length; i++) {
        const nftId = nftIds[i];
        setProgress({ current: i + 1, total: nftIds.length });

        try {
          const holders = await fetchSingleNFTHolders(nftId);
          holdersMap.set(nftId, holders);
          
          // Petit délai pour éviter le rate limiting
          if (i < nftIds.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (err) {
          console.error(`Error fetching holders for ${nftId}:`, err);
          holdersMap.set(nftId, []); // Set empty array for failed requests
        }
      }

      return holdersMap;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  }, []);

  return {
    fetchBatchHolders,
    loading,
    error,
    progress
  };
};
