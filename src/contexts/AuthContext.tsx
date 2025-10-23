import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGetAccount, Message, Address, getAccountProvider } from 'lib';
import { authAPI } from 'api/auth';

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
  localStorage.removeItem('accessToken');
  localStorage.removeItem('galacticx.user');
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
    const token = localStorage.getItem('accessToken');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('galacticx.user') || '{}');
      if (userData.id && userData.wallet_address === address) {
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

      // 3. Envoyer au Backend API
      const response = await authAPI.login(address, signature, messageToSign);
      
      // 🔍 Debug: Vérifier la structure de réponse
      console.log('[AuthProvider] Response complète:', response);
      console.log('[AuthProvider] Success:', response.success);
      console.log('[AuthProvider] Data:', response.data);
      console.log('[AuthProvider] User:', response.data?.user);
      console.log('[AuthProvider] Token:', response.data?.accessToken);
      
      // Vérifier que la réponse est valide
      if (!response.success || !response.data) {
        throw new Error('Réponse API invalide');
      }
      
      console.log('[AuthProvider] JWT reçu pour user:', response.data.user.id);

      // 4. Stocker le JWT et les données utilisateur
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('galacticx.user', JSON.stringify({
        id: response.data.user.id,
        wallet_address: response.data.user.walletAddress,
        role: response.data.user.role,
        username: response.data.user.username,
        totalPoints: response.data.user.totalPoints,
        currentStreak: response.data.user.currentStreak,
        nftCount: response.data.user.nftCount
      }));

      setAuthState({
        isAuthenticated: true,
        loading: false,
        error: null,
        supabaseUserId: response.data.user.id
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
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // Pas de token, demander signature automatiquement
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

