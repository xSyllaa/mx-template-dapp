import { useEffect, useState } from 'react';
import { useGetAccount, Message, Address, getAccountProvider } from 'lib';
import { supabase } from 'lib/supabase/client';

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
  canRetry: boolean;
}

// Fonction utilitaire pour nettoyer l'authentification
export const clearSupabaseAuth = () => {
  console.log('🧹 [SupabaseAuth] Nettoyage de l\'authentification...');
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('galacticx.user');
  localStorage.removeItem('supabase.auth.expires_at');
  console.log('✅ [SupabaseAuth] Authentification nettoyée');
};

export const useSupabaseAuth = () => {
  const { address } = useGetAccount();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    loading: false,
    error: null,
    canRetry: false
  });

  useEffect(() => {
    const authenticateWithSupabase = async () => {
      if (!address) {
        console.log('🔌 [SupabaseAuth] Pas de wallet connecté');
        // Clear session si wallet déconnecté
        await supabase.auth.signOut();
        
        // Nettoyer tous les tokens et données d'authentification
        clearSupabaseAuth();
        
        setAuthState({
          isAuthenticated: false,
          loading: false,
          error: null,
          canRetry: false
        });

        // Emit event for other components to listen
        window.dispatchEvent(new CustomEvent('supabaseAuthChanged', {
          detail: { isAuthenticated: false, userId: null }
        }));
        return;
      }

      try {
        setAuthState(prev => ({ ...prev, loading: true }));
        console.log('🔐 [SupabaseAuth] Authentification Supabase pour:', address);

        // 1. Vérifier si déjà authentifié avec le bon wallet
        const storedToken = localStorage.getItem('supabase.auth.token');
        const storedUser = localStorage.getItem('galacticx.user');
        const tokenExpiry = localStorage.getItem('supabase.auth.expires_at');
        
        if (storedToken && storedUser && tokenExpiry) {
          const user = JSON.parse(storedUser);
          const now = Date.now();
          const expiresAt = parseInt(tokenExpiry);
          
          if (user.wallet_address === address && now < expiresAt) {
            console.log('✅ [SupabaseAuth] Déjà authentifié avec session valide');
            // Note: Supabase client gère automatiquement l'Authorization header
            // Le JWT sera utilisé automatiquement pour les requêtes authentifiées
            setAuthState({
              isAuthenticated: true,
              loading: false,
              error: null,
              canRetry: false
            });
            return;
          } else if (user.wallet_address === address && now >= expiresAt) {
            console.log('⏰ [SupabaseAuth] Token expiré, nettoyage...');
            clearSupabaseAuth();
          }
        }

        // Si connecté avec un autre wallet, se déconnecter d'abord
        if (storedToken && storedUser && JSON.parse(storedUser).wallet_address !== address) {
          console.log('🔄 [SupabaseAuth] Changement de wallet détecté, déconnexion...');
          clearSupabaseAuth();
        }

        // 2. Générer un message unique à signer
        const nonce = Math.random().toString(36).substring(7);
        const timestamp = Date.now();
        const messageToSign = `GalacticX Authentication\nWallet: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

        console.log('📝 [SupabaseAuth] Demande de signature...');

        // 3. Signer le message avec MultiversX
        const provider = getAccountProvider();
        const message = new Message({
          address: new Address(address),
          data: new Uint8Array(Buffer.from(messageToSign))
        });

        const signedMessage = await provider.signMessage(message);

        if (!signedMessage?.signature) {
          throw new Error('Signature refusée par l\'utilisateur');
        }

        const signature = Buffer.from(signedMessage.signature).toString('hex');
        console.log('✍️ [SupabaseAuth] Message signé avec succès');

        // 4. Envoyer à l'Edge Function pour authentification
        console.log('📡 [SupabaseAuth] Envoi à Edge Function...');
        console.log('🔍 [SupabaseAuth] Détails de la requête:', {
          url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-multiversx`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY ? '***MASQUÉ***' : 'MANQUANT'
          },
          body: {
            walletAddress: address,
            signature: signature ? '***MASQUÉ***' : 'MANQUANT',
            message: messageToSign ? '***MASQUÉ***' : 'MANQUANT'
          }
        });
        
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
        console.log('🎫 [SupabaseAuth] JWT Custom reçu:', {
          user_id: data.user_id,
          wallet: data.wallet_address,
          role: data.role
        });

        // 5. Stocker le JWT custom dans localStorage
        // Supabase utilisera ce token pour toutes les requêtes
        const expiresAt = Date.now() + (data.expires_in * 1000); // Convertir en millisecondes
        localStorage.setItem('supabase.auth.token', data.access_token);
        localStorage.setItem('supabase.auth.expires_at', expiresAt.toString());
        localStorage.setItem('galacticx.user', JSON.stringify({
          id: data.user_id,
          wallet_address: data.wallet_address,
          role: data.role
        }));

        console.log('✅ [SupabaseAuth] JWT Custom configuré !');
        
        setAuthState({
          isAuthenticated: true,
          loading: false,
          error: null,
          canRetry: false
        });

        // Emit event for other components to listen
        window.dispatchEvent(new CustomEvent('supabaseAuthChanged', {
          detail: { isAuthenticated: true, userId: data.user_id }
        }));

      } catch (error) {
        console.error('❌ [SupabaseAuth] Erreur:', error);
        setAuthState({
          isAuthenticated: false,
          loading: false,
          error: error as Error,
          canRetry: true
        });

        // Emit event for other components to listen
        window.dispatchEvent(new CustomEvent('supabaseAuthChanged', {
          detail: { isAuthenticated: false, userId: null, error: (error as Error).message }
        }));
      }
    };

    authenticateWithSupabase();
    
    // Écouter les événements de retry
    const handleRetryEvent = () => {
      console.log('🔄 [SupabaseAuth] Retry demandé via événement');
      authenticateWithSupabase();
    };
    
    window.addEventListener('retrySupabaseAuth', handleRetryEvent);
    
    return () => {
      window.removeEventListener('retrySupabaseAuth', handleRetryEvent);
    };
  }, [address]);

  return authState;
};

