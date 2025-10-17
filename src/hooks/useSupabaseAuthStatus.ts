import { useEffect, useState } from 'react';
import { useGetAccount } from 'lib';
import { supabase } from 'lib/supabase/client';
import { clearSupabaseAuth } from './useSupabaseAuth';

interface SupabaseAuthStatus {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  canRetry: boolean;
  hasSigned: boolean; // Nouveau: indique si l'utilisateur a signé
}

export const useSupabaseAuthStatus = () => {
  const { address } = useGetAccount();
  const [status, setStatus] = useState<SupabaseAuthStatus>({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    canRetry: false,
    hasSigned: false
  });

  useEffect(() => {
    const checkAuthStatus = () => {
      if (!address) {
        setStatus({
          isAuthenticated: false,
          isLoading: false,
          error: null,
          canRetry: false,
          hasSigned: false
        });
        return;
      }

      // Vérifier si on a un JWT custom valide (signature réussie)
      const storedToken = localStorage.getItem('supabase.auth.token');
      const storedUser = localStorage.getItem('galacticx.user');
      
      if (storedToken && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.wallet_address === address) {
            // Vérifier que le token n'est pas expiré
            const tokenExpiry = localStorage.getItem('supabase.auth.expires_at');
            const now = Date.now();
            
            if (tokenExpiry && now < parseInt(tokenExpiry)) {
              setStatus({
                isAuthenticated: true,
                isLoading: false,
                error: null,
                canRetry: false,
                hasSigned: true // ✅ Signature réussie
              });
              return;
            } else {
              // Token expiré
              clearSupabaseAuth();
            }
          }
        } catch (error) {
          console.error('Erreur parsing stored user:', error);
        }
      }

      // Si pas de JWT custom valide, on peut retry la signature
      setStatus({
        isAuthenticated: false,
        isLoading: false,
        error: 'Signature MultiversX requise',
        canRetry: true,
        hasSigned: false // ❌ Pas encore signé
      });
    };

    checkAuthStatus();
    
    // Vérifier périodiquement (pour les changements dans le même onglet)
    const interval = setInterval(checkAuthStatus, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, [address]);

  const retryAuth = () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Nettoyer les anciens tokens
    clearSupabaseAuth();
    
    // Déclencher une nouvelle tentative d'authentification
    // Au lieu de recharger la page, on déclenche un événement personnalisé
    // que useSupabaseAuth peut écouter
    window.dispatchEvent(new CustomEvent('retrySupabaseAuth'));
  };

  return {
    ...status,
    retryAuth
  };
};
