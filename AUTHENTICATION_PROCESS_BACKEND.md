# 🔐 Processus d'Authentification - Backend Implementation

## 📋 Vue d'ensemble

Le frontend envoie une requête d'authentification avec signature MultiversX au backend. Le backend doit vérifier la signature et retourner un JWT.

---

## 🔄 Flow Complet

### 1. **Requête Frontend → Backend**

**Endpoint :** `POST /api/auth/login`

**Headers :**
```http
Content-Type: application/json
```

**Body :**
```json
{
  "walletAddress": "erd1kingowlgalacticx000000000000000000000000000000000000000",
  "signature": "a1b2c3d4e5f6789...",
  "message": "GalacticX Authentication\nWallet: erd1kingowlgalacticx000000000000000000000000000000000000000\nNonce: xyz123\nTimestamp: 1703123456789"
}
```

### 2. **Backend Response Attendu**

**Success (200) :**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cd4c7fed-d5ca-4aca-9314-f8168852e672",
      "walletAddress": "erd1kingowlgalacticx000000000000000000000000000000000000000",
      "username": "KingOwl",
      "role": "admin",
      "totalPoints": 5000,
      "nftCount": 50
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "1h"
  }
}
```

**Error (401/400) :**
```json
{
  "success": false,
  "error": "Signature invalide"
}
```

---

## 🛠 Implementation Backend

### **Dépendances Requises**

```bash
npm install @multiversx/sdk-core jsonwebtoken
npm install -D @types/jsonwebtoken
```

### **Variables d'Environnement**

```env
JWT_SECRET=your_jwt_secret_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Code Backend Complet**

```typescript
import { UserSigner, UserVerifier } from '@multiversx/sdk-core';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Vérifie la signature MultiversX
 */
async function verifyMultiversXSignature(
  walletAddress: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    const verifier = new UserVerifier();
    const messageBuffer = Buffer.from(message, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'hex');
    
    return await verifier.verify(
      messageBuffer,
      signatureBuffer,
      walletAddress
    );
  } catch (error) {
    console.error('Erreur vérification signature:', error);
    return false;
  }
}

/**
 * Endpoint POST /api/auth/login
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;
    
    // 1. Validation des paramètres
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: walletAddress, signature, message'
      });
    }
    
    console.log('🔐 [Auth] Authentification pour wallet:', walletAddress);
    
    // 2. Vérifier la signature MultiversX
    const isValid = await verifyMultiversXSignature(walletAddress, message, signature);
    if (!isValid) {
      console.log('❌ [Auth] Signature invalide');
      return res.status(401).json({
        success: false,
        error: 'Signature invalide'
      });
    }
    
    console.log('✅ [Auth] Signature MultiversX vérifiée avec succès');
    
    // 3. Chercher l'utilisateur existant
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, wallet_address, role, username, total_points, nft_count')
      .eq('wallet_address', walletAddress)
      .single();
    
    let user;
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // Utilisateur n'existe pas - créer nouveau profil
      console.log('✨ [Auth] Création nouveau profil');
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          role: 'user',
          total_points: 0,
          nft_count: 0
        })
        .select('id, wallet_address, role, username, total_points, nft_count')
        .single();
      
      if (insertError) {
        console.error('❌ [Auth] Erreur création utilisateur:', insertError);
        return res.status(500).json({
          success: false,
          error: 'Erreur création utilisateur'
        });
      }
      
      user = newUser;
      console.log('✅ [Auth] Profil créé:', user.id);
      
    } else if (existingUser) {
      // Utilisateur existe
      user = existingUser;
      console.log('👤 [Auth] Utilisateur existant:', user.id);
    } else {
      console.error('❌ [Auth] Erreur base de données:', fetchError);
      return res.status(500).json({
        success: false,
        error: 'Erreur base de données'
      });
    }
    
    // 4. Générer JWT
    const token = jwt.sign(
      {
        sub: user.id,
        wallet_address: walletAddress,
        role: user.role,
        aud: 'authenticated'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    
    console.log('🎫 [Auth] JWT généré pour user:', user.id);
    
    // 5. Retourner la réponse
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          walletAddress: user.wallet_address,
          username: user.username,
          role: user.role,
          totalPoints: user.total_points,
          nftCount: user.nft_count
        },
        accessToken: token,
        expiresIn: '1h'
      }
    });
    
  } catch (error) {
    console.error('❌ [Auth] Erreur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});
```

---

## 🔑 Structure JWT Généré

```json
{
  "sub": "cd4c7fed-d5ca-4aca-9314-f8168852e672",
  "wallet_address": "erd1kingowlgalacticx000000000000000000000000000000000000000",
  "role": "admin",
  "aud": "authenticated",
  "exp": 1703127056,
  "iat": 1703123456
}
```

---

## 🛡️ Sécurité

### **Niveau 1 : Signature Cryptographique**
- Seul le détenteur de la clé privée peut signer
- Signature vérifiée par `@multiversx/sdk-core`
- Impossible de forger

### **Niveau 2 : JWT Signé**
- Token signé avec `JWT_SECRET`
- Expire après 1 heure
- Claims personnalisés : `wallet_address`, `role`

### **Niveau 3 : Base de Données**
- Utilisateur créé/récupéré dans `public.users`
- Rôle stocké : `user` ou `admin`
- Pas d'email requis

---

## 📝 Logs de Debug

```
🔐 [Auth] Authentification pour wallet: erd1...
✅ [Auth] Signature MultiversX vérifiée avec succès
👤 [Auth] Utilisateur existant: cd4c7fed-d5ca-4aca-9314-f8168852e672
🎫 [Auth] JWT généré pour user: cd4c7fed-d5ca-4aca-9314-f8168852e672
```

---

## ✅ Checklist Implementation

- [ ] Installer `@multiversx/sdk-core` et `jsonwebtoken`
- [ ] Configurer variables d'environnement
- [ ] Implémenter `verifyMultiversXSignature()`
- [ ] Implémenter endpoint `POST /api/auth/login`
- [ ] Tester avec signature valide
- [ ] Tester avec signature invalide
- [ ] Vérifier création utilisateur
- [ ] Vérifier JWT généré
- [ ] Tester avec frontend

---

**📌 Note :** Ce processus remplace complètement l'Edge Function Supabase par votre backend personnalisé.
