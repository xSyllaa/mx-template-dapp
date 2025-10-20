import { useEffect, useState, useCallback } from 'react';
import { useGetAccount } from 'lib';
import { supabase } from 'lib/supabase/client';

interface UserProfile {
  id: string;
  wallet_address: string;
  username: string | null;
  username_last_modified: string | null;
  role: 'user' | 'admin';
  total_points: number;
  nft_count: number;
}

export const useUserRole = () => {
  const { address } = useGetAccount();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshProfile = useCallback(() => {
    console.log('🔄 [useUserRole] Manual refresh triggered');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!address) {
        console.log('🔌 [useUserRole] Pas de wallet connecté');
        setUserProfile(null);
        setLoading(false);
        return;
      }

      console.log('🚀 [useUserRole] Wallet connecté:', address);
      console.log('📡 [useUserRole] Interrogation Supabase...');

      try {
        setLoading(true);
        
        // Chercher le profil existant (créé par l'Edge Function auth-multiversx)
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('id, wallet_address, username, username_last_modified, role, total_points, nft_count')
          .eq('wallet_address', address)
          .maybeSingle(); // Use maybeSingle instead of single to avoid error on 0 rows

        if (fetchError) {
          console.error('❌ [useUserRole] Erreur lors de la récupération:', fetchError);
          throw fetchError;
        }

        if (!data) {
          // User n'existe pas encore (Edge Function n'a pas été appelée)
          console.warn('⚠️ [useUserRole] Profil non trouvé - L\'Edge Function n\'a peut-être pas créé l\'user');
          console.log('💡 [useUserRole] Vérifiez que l\'authentification MultiversX a bien été effectuée');
          
          // Ne pas créer ici - laisser l'Edge Function gérer la création
          // L'user doit d'abord s'authentifier via AuthContext
          setUserProfile(null);
          setError(new Error('User not authenticated. Please sign in first.'));
        } else {
          // Profil existe
          console.log('✅ [useUserRole] Profil trouvé:', {
            id: data.id,
            wallet: data.wallet_address,
            username: data.username || '(non défini)',
            role: data.role,
            isAdmin: data.role === 'admin',
            points: data.total_points,
            nftCount: data.nft_count
          });

          if (data.role === 'admin') {
            console.log('👑 [useUserRole] ACCÈS ADMIN DÉTECTÉ');
          } else {
            console.log('👤 [useUserRole] Utilisateur standard');
          }
          
          setUserProfile(data);
          setError(null);
        }
      } catch (err) {
        console.error('❌ [useUserRole] Erreur:', err);
        setError(err as Error);
        setUserProfile(null);
      } finally {
        setLoading(false);
        console.log('🏁 [useUserRole] Chargement terminé');
      }
    };

    fetchUserProfile();
  }, [address, refreshTrigger]);

  return {
    userProfile,
    isAdmin: userProfile?.role === 'admin',
    loading,
    error,
    refreshProfile
  };
};

