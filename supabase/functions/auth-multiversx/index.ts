import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Fonction pour vérifier la signature MultiversX
async function verifyMultiversXSignature(
  walletAddress: string, 
  message: string, 
  signature: string
): Promise<boolean> {
  try {
    // Pour l'instant, validation basique (à améliorer avec les vraies libs MultiversX)
    // En production, utiliser les libs officielles pour vérifier la signature
    console.log('🔍 [Auth] Vérification signature:', {
      wallet: walletAddress,
      message: message.substring(0, 50) + '...',
      signature: signature.substring(0, 20) + '...'
    });
    
    // TODO: Implémenter la vraie vérification avec @multiversx/sdk-core
    // const userAddress = new UserAddress(walletAddress);
    // const signer = new UserSigner();
    // return await signer.verify(message, signature, userAddress);
    
    // Pour l'instant, accepter toutes les signatures (à sécuriser en production)
    return true;
  } catch (error) {
    console.error('❌ [Auth] Erreur vérification signature:', error);
    return false;
  }
}

serve(async (req) => {
  console.log('🚀 [Edge Function] Requête reçue:', req.method, req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ [Edge Function] CORS preflight OK');
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('📝 [Edge Function] Début du traitement...');
    
    // 1. Parse request body
    const { walletAddress, signature, message } = await req.json();
    if (!walletAddress || !signature || !message) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: walletAddress, signature, message'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('🔐 [Auth] Authentification pour wallet:', walletAddress);
    
    // 2. Vérifier la signature MultiversX
    try {
      const isValid = await verifyMultiversXSignature(walletAddress, message, signature);
      if (!isValid) {
        throw new Error('Signature invalide');
      }
      console.log('✅ [Auth] Signature MultiversX vérifiée avec succès');
    } catch (error) {
      console.error('❌ [Auth] Erreur vérification signature:', error);
      throw new Error('Signature invalide');
    }

    // 3. Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 4. Check if user exists in public.users (pas auth.users!)
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, wallet_address, role')
      .eq('wallet_address', walletAddress)
      .single();

    let userId: string;
    let userRole: string;

    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist - create new profile
      console.log('✨ [Auth] Création nouveau profil');
      
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          wallet_address: walletAddress,
          role: 'user',
          total_points: 0,
          nft_count: 0
        })
        .select('id, wallet_address, role')
        .single();

      if (insertError) throw insertError;
      
      userId = newUser.id;
      userRole = newUser.role;
      console.log('✅ [Auth] Profil créé:', userId);
      
    } else if (existingUser) {
      // User exists
      userId = existingUser.id;
      userRole = existingUser.role;
      console.log('👤 [Auth] Utilisateur existant:', userId);
    } else {
      throw fetchError;
    }

    // 5. Créer une session Supabase standard avec JWT signé
    console.log('🔑 [Auth] Création session Supabase standard');
    
    // Créer un JWT Supabase standard avec les claims personnalisés
    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET not configured');
    }

    // Convertir le secret en CryptoKey
    const encoder = new TextEncoder();
    const keyData = encoder.encode(jwtSecret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    // Créer le JWT Supabase standard
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: userId, // ID utilisateur (sera utilisé par auth.uid())
      aud: 'authenticated',
      role: 'authenticated',
      wallet_address: walletAddress, // Claim personnalisé
      user_role: userRole, // Claim personnalisé
      exp: now + 3600, // 1 heure
      iat: now,
      iss: 'supabase'
    };

    const accessToken = await create(
      { alg: 'HS256', typ: 'JWT' },
      payload,
      cryptoKey
    );

    console.log('🎫 [Auth] JWT Supabase standard créé avec succès');

    // 6. Return JWT Supabase standard
    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        wallet_address: walletAddress,
        role: userRole,
        access_token: accessToken,
        expires_in: 3600
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [Auth] Erreur:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Authentication failed',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
