import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 [Edge Function] Requête reçue:', req.method, req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ [Edge Function] CORS preflight OK');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('📝 [Edge Function] Début du traitement...');
    // 1. Parse request body
    const { walletAddress, signature, message } = await req.json();

    if (!walletAddress || !signature || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: walletAddress, signature, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔐 [Auth] Authentification pour wallet:', walletAddress);

    // 2. TODO: Verify MultiversX signature (nécessite @multiversx/sdk-core)
    // Pour l'instant, on fait confiance (à sécuriser en production)
    // const isValid = await verifyMultiversXSignature(walletAddress, message, signature);
    // if (!isValid) throw new Error('Invalid signature');
    
    console.log('✅ [Auth] Signature acceptée (validation à implémenter)');

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

    // 5. Generate Custom JWT (no email needed!)
    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET not configured');
    }

    // Convert secret to CryptoKey
    const encoder = new TextEncoder();
    const keyData = encoder.encode(jwtSecret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    // Create custom JWT with wallet as identifier
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: userId,  // User ID
      wallet_address: walletAddress,  // Wallet address for custom claims
      role: userRole,  // User role (user or admin)
      aud: 'authenticated',
      exp: getNumericDate(3600),  // 1 hour
      iat: now,
      iss: 'supabase'
    };

    const accessToken = await create(
      { alg: 'HS256', typ: 'JWT' },
      payload,
      cryptoKey
    );

    console.log('🎫 [Auth] Custom JWT généré avec succès');

    // 6. Return custom JWT (no refresh token for now)
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

