# 🌟 Team of the Week - Guide d'Implémentation Complet

## 📋 Vue d'ensemble

La fonctionnalité **Team of the Week** permet aux administrateurs de sélectionner hebdomadairement 15 joueurs vedettes et d'afficher automatiquement les wallets détenteurs de leurs NFTs via l'API MultiversX.

## 🏗️ Architecture

### Structure des fichiers créés

```
src/features/teamOfWeek/
├── components/
│   ├── PlayerSearchDropdown.tsx      # Dropdown de recherche avec autocomplétion
│   ├── SelectedPlayerCard.tsx        # Carte d'un joueur sélectionné
│   ├── CreateTeamOfWeekModal.tsx     # Modal de création d'équipe
│   ├── TeamOfWeekDisplay.tsx         # Affichage public de l'équipe
│   └── index.ts
├── hooks/
│   ├── useNFTHolders.ts             # Hook pour l'API MultiversX
│   └── index.ts
├── services/
│   ├── teamOfWeekService.ts         # Service Supabase
│   ├── playerSearchService.ts       # Service de recherche de joueurs
│   └── index.ts
├── types.ts                         # Types TypeScript
└── index.ts

src/pages/Admin/
└── ManageTeamOfWeek.tsx            # Page admin de gestion

TEAM_OF_WEEK_MIGRATION.sql         # Migration base de données
```

## 🗄️ Base de données

### Table `team_of_week`

```sql
CREATE TABLE team_of_week (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Team of the Week',
  description TEXT,
  players JSONB NOT NULL,           -- Données des joueurs + détenteurs
  total_holders INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Structure JSONB `players`

```json
[
  {
    "id": "#2",
    "name": "Kyle Walker",
    "nftId": "MAINSEASON-3db9f8-02e2",
    "position": "DEF",
    "rarity": "Rare",
    "holders": [
      {
        "address": "erd1z563juvyfl7etnev8ua65vzhx65ln0rp0m783hq2m2wgdxx6z83s9t2cmv",
        "balance": "1"
      }
    ]
  }
]
```

## 🔧 Fonctionnalités Implémentées

### 1. Interface Admin (`/admin/team-of-week`)

#### ✅ Recherche de joueurs intelligente
- **Autocomplétion** : Tape 2+ caractères → suggestions
- **Fuzzy matching** : Trouve même avec fautes de frappe
- **Filtrage** : Exclut les joueurs déjà sélectionnés
- **Navigation clavier** : ↑↓ Enter Escape

#### ✅ Sélection d'équipe (max 15 joueurs)
- **Cartes visuelles** avec rareté (couleurs)
- **Récupération automatique** des détenteurs NFT
- **Copie d'adresses** individuelle ou globale
- **Validation** : limite 15 joueurs

#### ✅ Gestion des équipes
- **Création** avec dates et description
- **Activation/désactivation** (une seule active)
- **Suppression** avec confirmation
- **Historique** de toutes les équipes

### 2. Affichage Public (`/team-of-week`)

#### ✅ Design moderne et responsive
- **Grille adaptative** : 1-4 colonnes selon écran
- **Cartes gradient** selon rareté NFT
- **Animations** : hover, scale, transitions
- **Statistiques** : joueurs, détenteurs uniques

#### ✅ Interaction utilisateur
- **Expansion** des listes de détenteurs
- **Copie d'adresses** par joueur ou globale
- **États vides** : pas d'équipe active
- **Gestion d'erreurs** avec retry

### 3. API MultiversX Integration

#### ✅ Hook `useNFTHolders`
```typescript
const { holders, loading, error, fetchHolders } = useNFTHolders();
await fetchHolders('MAINSEASON-3db9f8-02e2');
```

#### ✅ Endpoint utilisé
```bash
GET https://api.multiversx.com/nfts/{nftId}/accounts
```

#### ✅ Gestion d'erreurs
- **Timeout** et erreurs réseau
- **NFT inexistant** (404)
- **Rate limiting** (429)

## 🚀 Instructions de Déploiement

### 1. Migration Base de Données

```powershell
# Exécuter la migration
supabase db push

# Ou manuellement dans le dashboard Supabase
# Copier le contenu de TEAM_OF_WEEK_MIGRATION.sql
```

### 2. Vérification des Permissions

Assurer que l'utilisateur admin a le rôle `admin` :

```sql
UPDATE users 
SET role = 'admin' 
WHERE wallet_address = 'erd1your_admin_wallet';
```

### 3. Test de l'API MultiversX

```bash
# Tester un NFT existant
curl -X 'GET' \
  'https://api.multiversx.com/nfts/MAINSEASON-3db9f8-02e2/accounts' \
  -H 'accept: application/json'
```

## 📱 Guide d'Utilisation

### Pour l'Admin

1. **Accéder** : `/admin` → "Team of the Week"
2. **Créer** : "➕ Créer une nouvelle Team"
3. **Rechercher** : Taper nom joueur → sélectionner
4. **Récupérer** : "🔍 Récupérer les détenteurs" par joueur
5. **Copier** : "📋 Copier toutes les adresses"
6. **Publier** : "✅ Créer la Team" (devient active)

### Pour les Utilisateurs

1. **Voir** : `/team-of-week` → équipe active
2. **Explorer** : Cliquer "🔽 Voir les détenteurs"
3. **Copier** : "📋 Copier" adresses individuelles/globales

## 🔒 Sécurité

### RLS (Row Level Security)
- **Lecture** : Tous les utilisateurs authentifiés
- **Écriture** : Admins uniquement
- **Validation** : JWT custom avec `get_current_user_id()`

### Validation Frontend
- **Limite** : Max 15 joueurs
- **NFT requis** : Seulement joueurs avec NFT
- **Dates** : Validation période cohérente

## 🎨 Thèmes

Tous les composants utilisent les **CSS variables** :
- `--mvx-text-color-primary` : Texte principal
- `--mvx-bg-color-secondary` : Arrière-plans cartes
- `--mvx-text-accent-color` : Couleur accent
- Compatible avec les 3 thèmes (Dark, Light, Vibe)

## 🐛 Dépannage

### Problèmes courants

#### 1. "Aucun joueur trouvé"
- **Cause** : `playersData.json` pas chargé
- **Solution** : Vérifier import dans `playerSearchService.ts`

#### 2. "API Error: 404"
- **Cause** : NFT ID inexistant
- **Solution** : Vérifier format `MAINSEASON-xxx-xxx`

#### 3. "User ID is required"
- **Cause** : Problème authentification
- **Solution** : Vérifier `useAuth()` et JWT

#### 4. Erreur RLS
- **Cause** : Permissions manquantes
- **Solution** : Vérifier rôle admin en DB

### Logs utiles

```typescript
// Debug recherche joueurs
console.log('Search results:', PlayerSearchService.searchPlayers('walker'));

// Debug API MultiversX
console.log('NFT holders:', await fetchHolders('MAINSEASON-3db9f8-02e2'));

// Debug auth
console.log('User role:', useUserRole());
```

## 🔄 Améliorations Futures

### Fonctionnalités suggérées
- **Notifications** : Toast confirmations
- **Historique** : Archive des équipes passées
- **Statistiques** : Analytics détenteurs
- **Export** : CSV/Excel des adresses
- **Scheduling** : Activation automatique
- **Templates** : Équipes pré-définies

### Optimisations techniques
- **Cache** : Détenteurs NFT (Redis)
- **Batch** : Récupération multiple NFTs
- **Pagination** : Grandes listes détenteurs
- **WebSocket** : Updates temps réel

## 📞 Support

En cas de problème :
1. Vérifier les **logs console**
2. Tester l'**API MultiversX** manuellement
3. Vérifier les **permissions Supabase**
4. Consulter la **documentation MultiversX**

---

**✅ Implémentation terminée et prête à l'emploi !**
