import { useEffect, useState } from 'react';
import { useGetAccount } from 'lib';
import { supabase } from 'lib/supabase/client';

interface UserProfile {
  id: string;
  wallet_address: string;
  username: string | null;
  role: 'user' | 'admin';
  total_points: number;
  nft_count: number;
}

export const useUserRole = () => {
  const { address } = useGetAccount();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
        
        // Étape 1 : Chercher le profil existant
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('id, wallet_address, username, role, total_points, nft_count')
          .eq('wallet_address', address)
          .single();

        if (fetchError) {
          // Profil n'existe pas (code PGRST116 = no rows returned)
          if (fetchError.code === 'PGRST116') {
            console.log('👤 [useUserRole] Profil non trouvé → Création d\'un nouveau profil');
            
            // Étape 2 : Créer un nouveau profil
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert({
                wallet_address: address,
                role: 'user',
                total_points: 0,
                nft_count: 0
              })
              .select('id, wallet_address, username, role, total_points, nft_count')
              .single();

            if (insertError) throw insertError;
            
            console.log('✅ [useUserRole] Nouveau profil créé:', {
              id: newUser.id,
              wallet: newUser.wallet_address,
              role: newUser.role,
              points: newUser.total_points
            });
            
            setUserProfile(newUser);
          } else {
            throw fetchError;
          }
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
        }

        setError(null);
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
  }, [address]);

  return {
    userProfile,
    isAdmin: userProfile?.role === 'admin',
    loading,
    error
  };
};

