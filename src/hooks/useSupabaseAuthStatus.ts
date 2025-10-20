import { useEffect, useState } from 'react';
import { useGetAccount } from 'lib';
import { useAuth } from 'contexts/AuthContext';

interface SupabaseAuthStatus {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  canRetry: boolean;
  hasSigned: boolean; // Nouveau: indique si l'utilisateur a signé
}

export const useSupabaseAuthStatus = () => {
  const { address } = useGetAccount();
  const { isAuthenticated, loading, error, signIn } = useAuth();
  
  const [status, setStatus] = useState<SupabaseAuthStatus>({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    canRetry: false,
    hasSigned: false
  });

  useEffect(() => {
    setStatus({
      isAuthenticated,
      isLoading: loading,
      error: error?.message || null,
      canRetry: !isAuthenticated && !loading,
      hasSigned: isAuthenticated
    });
  }, [isAuthenticated, loading, error]);

  const retryAuth = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('[useSupabaseAuthStatus] Retry failed:', error);
    }
  };

  return {
    ...status,
    retryAuth
  };
};
