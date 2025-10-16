import { useEffect, useState } from 'react';
import { useGetAccount, Message, Address, getAccountProvider } from 'lib';
import { supabase } from 'lib/supabase/client';

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
}

export const useSupabaseAuth = () => {
  const { address } = useGetAccount();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    loading: false,
    error: null
  });

  useEffect(() => {
    const authenticateWithSupabase = async () => {
      if (!address) {
        console.log('🔌 [SupabaseAuth] Pas de wallet connecté');
        // Clear session si wallet déconnecté
        await supabase.auth.signOut();
        setAuthState({
          isAuthenticated: false,
          loading: false,
          error: null
        });
        return;
      }

      try {
        setAuthState(prev => ({ ...prev, loading: true }));
        console.log('🔐 [SupabaseAuth] Authentification Supabase pour:', address);

        // 1. Vérifier si déjà authentifié avec le bon wallet
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.user_metadata?.wallet_address === address) {
          console.log('✅ [SupabaseAuth] Déjà authentifié avec session valide');
          setAuthState({
            isAuthenticated: true,
            loading: false,
            error: null
          });
          return;
        }

        // Si connecté avec un autre wallet, se déconnecter d'abord
        if (session && session.user.user_metadata?.wallet_address !== address) {
          console.log('🔄 [SupabaseAuth] Changement de wallet détecté, déconnexion...');
          await supabase.auth.signOut();
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
        localStorage.setItem('supabase.auth.token', data.access_token);
        localStorage.setItem('galacticx.user', JSON.stringify({
          id: data.user_id,
          wallet_address: data.wallet_address,
          role: data.role
        }));

        console.log('✅ [SupabaseAuth] JWT Custom configuré !');
        
        setAuthState({
          isAuthenticated: true,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('❌ [SupabaseAuth] Erreur:', error);
        setAuthState({
          isAuthenticated: false,
          loading: false,
          error: error as Error
        });
      }
    };

    authenticateWithSupabase();
  }, [address]);

  return authState;
};

