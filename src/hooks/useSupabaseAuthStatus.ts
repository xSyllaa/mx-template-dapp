import { useEffect, useState } from 'react';
import { useGetAccount } from 'lib';
import { supabase } from 'lib/supabase/client';
import { clearSupabaseAuth } from './useSupabaseAuth';
import { useSupabaseAuthSync } from './useSupabaseAuthSync';

interface SupabaseAuthStatus {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  canRetry: boolean;
  hasSigned: boolean; // Nouveau: indique si l'utilisateur a signé
}

export const useSupabaseAuthStatus = () => {
  const { address } = useGetAccount();
  const globalState = useSupabaseAuthSync();
  const [status, setStatus] = useState<SupabaseAuthStatus>({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    canRetry: false,
    hasSigned: false
  });

  // Utiliser l'état global synchronisé
  useEffect(() => {
    setStatus({
      isAuthenticated: globalState.isAuthenticated,
      isLoading: globalState.isLoading,
      error: globalState.error,
      canRetry: !globalState.isAuthenticated && !globalState.isLoading,
      hasSigned: globalState.hasSigned
    });
  }, [globalState]);

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
