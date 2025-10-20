# 🌟 Team of the Week - Guide Complet d'Implémentation

## 📋 Vue d'ensemble

La fonctionnalité **Team of the Week** permet aux administrateurs de sélectionner 15 joueurs vedettes chaque semaine et d'afficher publiquement leur équipe avec les NFTs associés et la liste des détenteurs.

---

## 🎯 Fonctionnalités Principales

### 👤 Côté Utilisateur (Public)
- ✅ Affichage de la Team of the Week avec images NFT
- ✅ Sélection de semaines précédentes via dropdown
- ✅ Visualisation des cartes NFT avec thumbnails
- ✅ Clic sur NFT pour ouvrir modal détaillé (comme MyNFTs)
- ✅ Cache intelligent des données NFT (pas de rechargement inutile)
- ✅ Affichage responsive (5 colonnes sur desktop)

### 👨‍💼 Côté Admin
1. **Sélection de la Semaine**
   - Choix par numéro de semaine + année
   - Calcul automatique des dates de début/fin
   - Vérification qu'une team n'existe pas déjà pour cette période
   - Titre et description personnalisables

2. **Sélection des Joueurs**
   - Recherche intelligente avec dropdown
   - Suggestions depuis `playersData.json`
   - Limitation à 15 joueurs
   - Affichage avec rareté et position

3. **Récupération des Holders**
   - Appel API MultiversX pour chaque NFT
   - Affichage de la progression (X/15)
   - Deux modes d'affichage :
     * **Par NFTs** : Liste des NFTs avec leurs holders
     * **Par Adresses** : Liste des adresses avec le nombre de NFTs détenus
   - Copie intelligente selon le mode actif :
     * Mode NFTs : Format texte avec détails
     * Mode Adresses : Format CSV (address,count)

4. **Sauvegarde**
   - Stockage dans Supabase (`team_of_week`)
   - Protection RLS (admin uniquement)
   - Activation automatique de la team

---

## 🗂️ Structure des Fichiers

### Frontend

```
src/
├── pages/
│   ├── TeamOfWeek/
│   │   └── TeamOfWeek.tsx          # Page publique
│   └── Admin/
│       ├── Admin.tsx                # Dashboard admin
│       └── SelectTeamOfWeek.tsx     # Sélection Team of Week
│
├── features/
│   └── teamOfWeek/
│       ├── components/              # (vide pour l'instant)
│       ├── hooks/
│       │   ├── useNFTHolders.ts    # Récupérer holders d'un NFT
│       │   ├── useBatchNFTHolders.ts # Récupérer holders en batch
│       │   ├── useNFTDetails.ts    # Récupérer détails NFT (avec cache)
│       │   └── index.ts
│       ├── services/
│       │   ├── teamOfWeekService.ts # Interactions Supabase
│       │   ├── playerSearchService.ts # Recherche de joueurs
│       │   └── index.ts
│       └── types.ts                 # TypeScript types
│
└── routes/
    └── routes.ts                    # Routes (publiques + admin)
```

---

## 🔧 Configuration Supabase

### Table `team_of_week`

```sql
CREATE TABLE team_of_week (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  players JSONB NOT NULL,              -- Array de PlayerWithHolders
  total_holders INTEGER NOT NULL,
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Structure `players` (JSONB)

```json
[
  {
    "id": "player-id",
    "name": "Nom du Joueur",
    "nftId": "MAINSEASON-3db9f8-02e2",
    "rarity": "Legendary",
    "position": "ST",
    "holders": [
      {
        "address": "erd1...",
        "balance": "1"
      }
    ]
  }
]
```

### Politiques RLS

```sql
-- SELECT: Tout le monde
CREATE POLICY "Allow public read" ON team_of_week
FOR SELECT TO public USING (true);

-- INSERT: Admin uniquement
CREATE POLICY "Only admins can create team of the week" ON team_of_week
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = get_current_user_id() 
    AND users.role = 'admin'
  )
);

-- UPDATE: Admin uniquement
CREATE POLICY "Only admins can update" ON team_of_week
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = get_current_user_id() 
    AND users.role = 'admin'
  )
);

-- DELETE: Admin uniquement
CREATE POLICY "Only admins can delete" ON team_of_week
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = get_current_user_id() 
    AND users.role = 'admin'
  )
);
```

---

## 🔌 API MultiversX

### Récupérer les Holders d'un NFT

```bash
curl -X 'GET' \
  'https://api.multiversx.com/nfts/MAINSEASON-3db9f8-02e2/accounts' \
  -H 'accept: application/json'
```

**Réponse:**
```json
[
  {
    "address": "erd1z563juvyfl7etnev8ua65vzhx65ln0rp0m783hq2m2wgdxx6z83s9t2cmv",
    "balance": "1"
  }
]
```

### Récupérer les Détails d'un NFT

```bash
curl -X 'GET' \
  'https://api.multiversx.com/nfts/MAINSEASON-3db9f8-02e2' \
  -H 'accept: application/json'
```

**Réponse:**
```json
{
  "identifier": "MAINSEASON-3db9f8-02e2",
  "name": "Main Season #738",
  "media": [
    {
      "url": "https://media.multiversx.com/nfts/asset/.../2.mp4",
      "thumbnailUrl": "https://media.multiversx.com/nfts/thumbnail/MAINSEASON-3db9f8-027ecc59",
      "fileType": "video/mp4"
    }
  ],
  "metadata": {
    "attributes": [
      { "trait_type": "Name", "value": "KW" },
      { "trait_type": "Position", "value": "CB" },
      { "trait_type": "Nationality", "value": "England" }
    ]
  }
}
```

---

## 💾 Cache NFT Intelligent

### Fonctionnement

Le hook `useNFTDetails` implémente un **cache global** pour éviter de refaire des appels API :

```typescript
// Cache global (persiste entre les composants)
const nftDetailsCache = new Map<string, NFTDetails>();

// Vérification du cache avant l'appel API
if (nftDetailsCache.has(nftId)) {
  return nftDetailsCache.get(nftId);
}

// Stockage après récupération
nftDetailsCache.set(nftId, data);
```

### Avantages
- ✅ Pas de rechargement inutile lors du changement de semaine
- ✅ Performance optimale (une seule requête par NFT)
- ✅ Fonctionne sur toute la session utilisateur

---

## 🎨 Affichage des NFTs

### Page Team of the Week

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
  {selectedTeam.players.map((player) => {
    const nftDetails = nftDetailsMap.get(player.nftId);
    const thumbnailUrl = nftDetails?.media[0]?.thumbnailUrl;
    
    return (
      <button onClick={() => handleNFTClick(player.nftId)}>
        <img src={thumbnailUrl} alt={player.name} />
        <h3>{player.name}</h3>
        <span>{player.position}</span>
        <span>{player.rarity}</span>
      </button>
    );
  })}
</div>
```

### Modal de Détails

Réutilise le composant `NFTDetailModal` de `features/myNFTs` :
- ✅ Affichage vidéo HD
- ✅ Tous les attributs (performances, nationalité, etc.)
- ✅ Lien Transfermarkt
- ✅ Animation 3D premium

---

## 📊 Modes d'Affichage des Holders

### Mode "Par NFTs"

Affiche chaque NFT avec ses holders :

```
KW (MAINSEASON-3db9f8-02e2):
  erd1z563ju... (1)
  erd1abc123... (2)

Messi (MAINSEASON-3db9f8-04a1):
  erd1xyz789... (1)
```

**Copie :** Format texte brut

### Mode "Par Adresses" (CSV)

Affiche chaque adresse unique avec le total de NFTs :

```
address,count
erd1z563ju...,3
erd1abc123...,2
erd1xyz789...,1
```

**Copie :** Format CSV (importable dans Excel/Google Sheets)

---

## 🔒 Sécurité

### Vérifications Admin

```typescript
// Vérifier que l'utilisateur est admin
const { supabaseUserId } = useAuth();
if (!supabaseUserId) {
  setError('Vous devez être connecté');
  return;
}
```

### Vérification de Doublon

```typescript
// Vérifier qu'une team n'existe pas déjà pour cette semaine
const weekExists = await TeamOfWeekService.checkWeekExists(
  weekDates.start, 
  weekDates.end
);

if (weekExists) {
  toast.error('Une Team of the Week existe déjà pour cette période');
  return;
}
```

### RLS Policies

Toutes les opérations sensibles (INSERT/UPDATE/DELETE) sont protégées au niveau de la base de données :

```sql
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = get_current_user_id() 
    AND users.role = 'admin'
  )
)
```

---

## 🚀 Workflow Complet

### 1. Admin crée une Team of the Week

```
Dashboard Admin → "Select Team of the Week"
  ↓
Étape 1: Semaine
  - Numéro de semaine: 42
  - Année: 2025
  - Titre: "Les Légendes de la Semaine"
  - Description: "..."
  ↓
Étape 2: Joueurs
  - Recherche et sélection de 15 joueurs
  ↓
Étape 3: Holders
  - Récupération automatique des holders (API MultiversX)
  - Affichage par NFTs ou par Adresses
  - Copie CSV ou texte
  ↓
Sauvegarde → Supabase (team_of_week)
```

### 2. Utilisateur consulte la Team

```
Page Team of the Week
  ↓
Sélection de la semaine (dropdown)
  ↓
Chargement des NFT details (cache ou API)
  ↓
Affichage des cartes NFT avec thumbnails
  ↓
Clic sur NFT → Modal détaillé
```

---

## 🐛 Debugging

### Erreur RLS "new row violates row-level security policy"

**Cause:** L'utilisateur n'a pas le rôle `admin` ou `get_current_user_id()` ne retourne pas le bon ID.

**Solution:**
```sql
-- Vérifier l'utilisateur actuel
SELECT get_current_user_id(), 
       (SELECT role FROM users WHERE id = get_current_user_id());

-- Si NULL, vérifier que l'utilisateur est bien connecté
-- et que son wallet_address existe dans la table users
```

### Les images NFT ne s'affichent pas

**Cause:** Cache vide ou appel API échoué.

**Solution:**
```typescript
// Vérifier les logs console
console.log('NFT Details Map:', nftDetailsMap);
console.log('Thumbnail URL:', nftDetails?.media[0]?.thumbnailUrl);

// Vérifier que l'API répond
fetch('https://api.multiversx.com/nfts/MAINSEASON-3db9f8-02e2')
  .then(r => r.json())
  .then(console.log);
```

---

## 📝 TODO / Améliorations Futures

- [ ] Ajouter un système de notifications pour les holders
- [ ] Permettre de désactiver une team sans la supprimer
- [ ] Historique des Teams of the Week
- [ ] Export CSV de toutes les adresses
- [ ] Statistiques (nombre de holders unique par semaine)
- [ ] Intégration avec le système de récompenses

---

## 📚 Ressources

- **MultiversX API:** https://api.multiversx.com/
- **Supabase Docs:** https://supabase.com/docs
- **playersData.json:** `src/data/playersData.json`
- **NFTDetailModal:** `src/features/myNFTs/components/NFTDetailModal.tsx`

---

**✅ Implémentation terminée le 20/10/2025**

