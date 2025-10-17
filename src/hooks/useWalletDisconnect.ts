import { useCallback } from 'react';
import { useGetAccount, getAccountProvider } from 'lib';
import { clearSupabaseAuth } from './useSupabaseAuth';

export const useWalletDisconnect = () => {
  const { address } = useGetAccount();
  const provider = getAccountProvider();

  const disconnectWallet = useCallback(async () => {
    try {
      console.log('🔌 [WalletDisconnect] Déconnexion du wallet...');
      
      // 1. Nettoyer l'authentification Supabase
      clearSupabaseAuth();
      
      // 2. Déconnecter le wallet MultiversX
      if (provider && address) {
        await provider.logout();
        console.log('✅ [WalletDisconnect] Wallet déconnecté');
      }
      
      // 3. Optionnel : Rediriger vers la page d'accueil
      // window.location.href = '/';
      
    } catch (error) {
      console.error('❌ [WalletDisconnect] Erreur lors de la déconnexion:', error);
    }
  }, [provider, address]);

  return {
    disconnectWallet,
    isConnected: !!address
  };
};
