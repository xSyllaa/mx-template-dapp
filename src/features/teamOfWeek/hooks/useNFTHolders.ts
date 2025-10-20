import { useState, useCallback } from 'react';

export interface NFTHolder {
  address: string;
  balance: string;
}

export interface UseNFTHoldersReturn {
  holders: NFTHolder[];
  loading: boolean;
  error: string | null;
  fetchHolders: (nftId: string) => Promise<void>;
  clearHolders: () => void;
}

/**
 * Hook pour récupérer les détenteurs d'un NFT via l'API MultiversX
 * @returns Object avec holders, loading, error et fonctions utilitaires
 */
export const useNFTHolders = (): UseNFTHoldersReturn => {
  const [holders, setHolders] = useState<NFTHolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHolders = useCallback(async (nftId: string) => {
    if (!nftId) {
      setError('NFT ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
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
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data: NFTHolder[] = await response.json();
      setHolders(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching NFT holders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHolders = useCallback(() => {
    setHolders([]);
    setError(null);
  }, []);

  return {
    holders,
    loading,
    error,
    fetchHolders,
    clearHolders
  };
};
