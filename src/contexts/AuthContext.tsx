import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGetAccount, Message, Address, getAccountProvider } from 'lib';
import { getCustomJWT, configureRealtimeAuth, refreshSupabaseClient } from 'lib/supabase/client';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
  supabaseUserId: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fonction utilitaire pour nettoyer l'auth (exportée pour compatibilité)
export const clearAuthData = () => {
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('galacticx.user');
  localStorage.removeItem('supabase.auth.expires_at');
  configureRealtimeAuth(null);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { address } = useGetAccount();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    loading: false,
    error: null as Error | null,
    supabaseUserId: null as string | null
  });

  // Restaurer la session au montage (une seule fois)
  useEffect(() => {
    const jwt = getCustomJWT();
    if (jwt) {
      const userData = JSON.parse(localStorage.getItem('galacticx.user') || '{}');
      if (userData.id && userData.wallet_address === address) {
        configureRealtimeAuth(jwt);
        // Ensure REST requests use JWT immediately on restoration
        try {
          refreshSupabaseClient();
          console.log('[AuthProvider] Supabase REST headers configured on restore');
        } catch (e) {
          console.warn('[AuthProvider] Failed to configure REST headers on restore', e);
        }
        setAuthState({
          isAuthenticated: true,
          loading: false,
          error: null,
          supabaseUserId: userData.id
        });
        console.log('[AuthProvider] Session restaurée pour:', userData.wallet_address);
      } else {
        clearAuthData();
      }
    }
  }, []); // Seulement au montage

  // Fonction de signature (appelée manuellement ou automatiquement)
  const signIn = async () => {
    if (!address) {
      throw new Error('Wallet non connecté');
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      console.log('[AuthProvider] Début authentification pour:', address);

      // 1. Générer le message à signer
      const nonce = Math.random().toString(36).substring(7);
      const timestamp = Date.now();
      const messageToSign = `GalacticX Authentication\nWallet: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

      // 2. Signer avec MultiversX
      const provider = getAccountProvider();
      const message = new Message({
        address: new Address(address),
        data: new Uint8Array(Buffer.from(messageToSign))
      });

      const signedMessage = await provider.signMessage(message);
      if (!signedMessage?.signature) {
        throw new Error('Signature refusée');
      }

      const signature = Buffer.from(signedMessage.signature).toString('hex');
      console.log('[AuthProvider] Message signé avec succès');

      // 3. Envoyer à l'Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-multiversx`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            walletAddress: address,
            signature,
            message: messageToSign
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Authentification échouée');
      }

      const data = await response.json();
      console.log('[AuthProvider] JWT reçu pour user:', data.user_id);

      // 4. Stocker le JWT et configurer Supabase
      const expiresAt = Date.now() + (data.expires_in * 1000);
      localStorage.setItem('supabase.auth.token', data.access_token);
      localStorage.setItem('supabase.auth.expires_at', expiresAt.toString());
      localStorage.setItem('galacticx.user', JSON.stringify({
        id: data.user_id,
        wallet_address: data.wallet_address,
        role: data.role
      }));

      // Configurer immédiatement REST/Realtime avec le JWT
      try {
        refreshSupabaseClient();
        console.log('[AuthProvider] REST headers configured after sign-in');
      } catch (e) {
        console.warn('[AuthProvider] Failed to configure REST headers after sign-in', e);
      }
      configureRealtimeAuth(data.access_token);

      setAuthState({
        isAuthenticated: true,
        loading: false,
        error: null,
        supabaseUserId: data.user_id
      });

      console.log('[AuthProvider] Authentification réussie');

    } catch (error) {
      console.error('[AuthProvider] Erreur d\'authentification:', error);
      setAuthState({
        isAuthenticated: false,
        loading: false,
        error: error as Error,
        supabaseUserId: null
      });
      throw error;
    }
  };

  const signOut = async () => {
    console.log('[AuthProvider] Déconnexion');
    clearAuthData();
    setAuthState({
      isAuthenticated: false,
      loading: false,
      error: null,
      supabaseUserId: null
    });
  };

  // Auto sign-in si wallet connecté et pas de session
  useEffect(() => {
    if (address && !authState.isAuthenticated && !authState.loading) {
      const jwt = getCustomJWT();
      if (!jwt) {
        // Pas de JWT, demander signature automatiquement
        console.log('[AuthProvider] Pas de session, démarrage auto-signin');
        signIn().catch((error) => {
          // Gérer l'erreur silencieusement, l'utilisateur peut réessayer
          console.warn('[AuthProvider] Auto-signin échoué:', error.message);
        });
      }
    } else if (!address && authState.isAuthenticated) {
      // Wallet déconnecté, nettoyer
      console.log('[AuthProvider] Wallet déconnecté, nettoyage');
      signOut();
    }
  }, [address]); // Seulement quand l'adresse change

  return (
    <AuthContext.Provider value={{ ...authState, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour utiliser le context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

