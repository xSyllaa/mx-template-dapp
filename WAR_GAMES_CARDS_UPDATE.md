# War Games - Mise à Jour des Cartes

## 🎯 Fonctionnalités Ajoutées

### **1. Affichage de l'Adresse/Pseudo du Créateur**
- **Nom d'utilisateur** : Affiché en premier (ou "Anonyme" si pas de pseudo)
- **Adresse du portefeuille** : Affichée en dessous en format raccourci (8 premiers + ... + 6 derniers caractères)
- **Style monospace** : Pour une meilleure lisibilité de l'adresse

### **2. Affichage de l'Heure avec la Date**
- **Date de création** : Affichée en format local
- **Heure de création** : Affichée en dessous en format local
- **Alignement à droite** : Pour un meilleur équilibre visuel

### **3. Grisage des War Games Propres**
- **Détection automatique** : Compare `game.creatorId` avec `supabaseUserId`
- **Style grisé** : `opacity-50` et `cursor-not-allowed`
- **Bouton désactivé** : Remplace le bouton "Rejoindre" par "Ton War Game"
- **Pas de hover** : Supprime l'effet de survol pour les war games propres

## 🔧 Modifications Techniques

### **Fichiers Modifiés**

#### **1. `src/features/warGames/types.ts`**
```typescript
export interface WarGameWithDetails extends WarGame {
  creatorUsername?: string;
  creatorAvatarUrl?: string;
  creatorAddress?: string;        // ✅ Nouveau
  opponentUsername?: string;
  opponentAvatarUrl?: string;
  opponentAddress?: string;       // ✅ Nouveau
}
```

#### **2. `src/features/warGames/services/warGameService.ts`**
```typescript
// Dans getOpenWarGames()
return (data || []).map((game: any) => ({
  // ... autres propriétés
  creatorAddress: game.creator_address,  // ✅ Nouveau
}));
```

#### **3. `src/pages/WarGames/WarGames.tsx`**
```typescript
// Détection des war games propres
const isOwnWarGame = game.creatorId === supabaseUserId;

// Affichage conditionnel
{game.creatorAddress && (
  <span className="text-xs text-[var(--mvx-text-color-secondary)] font-mono">
    {game.creatorAddress.slice(0, 8)}...{game.creatorAddress.slice(-6)}
  </span>
)}

// Bouton conditionnel
{isOwnWarGame ? (
  <div className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg text-center font-semibold">
    {t('pages.warGames.activeGames.ownWarGame')}
  </div>
) : (
  <button onClick={...}>
    {t('pages.warGames.activeGames.joinButton')}
  </button>
)}
```

#### **4. `src/i18n/locales/en.json` et `fr.json`**
```json
"activeGames": {
  "title": "Active War Games",
  "stake": "Stake",
  "deadline": "Deadline",
  "joinButton": "Join This War Game",
  "ownWarGame": "Your War Game"  // ✅ Nouveau
}
```

### **5. `WAR_GAMES_ADD_CREATOR_ADDRESS.sql`**
```sql
-- Mise à jour de la fonction get_open_war_games
CREATE OR REPLACE FUNCTION get_open_war_games()
RETURNS TABLE (
  id UUID,
  creator_id UUID,
  creator_username TEXT,
  creator_address TEXT,  -- ✅ Nouveau
  points_stake INTEGER,
  entry_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wg.id,
    wg.creator_id,
    u.username,
    u.wallet_address,  -- ✅ Nouveau
    wg.points_stake,
    wg.entry_deadline,
    wg.created_at
  FROM public.war_games wg
  INNER JOIN public.users u ON u.id = wg.creator_id
  WHERE wg.status = 'open'
    AND wg.opponent_id IS NULL
    AND wg.entry_deadline > NOW()
  ORDER BY wg.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🎨 Interface Utilisateur

### **Carte de War Game Standard**
```
┌─────────────────────────────────────────┐
│ ⚔️ Username                   21/10/25 │
│    erd1abc...xyz123           14:30:25  │
│                                         │
│ Stake: 100 points                      │
│ Deadline: 25/10/25                      │
│                                         │
│ [Rejoindre ce War Game]                │
└─────────────────────────────────────────┘
```

### **Carte de War Game Propre (Grisée)**
```
┌─────────────────────────────────────────┐
│ ⚔️ Username                   21/10/25 │
│    erd1abc...xyz123           14:30:25  │
│                                         │
│ Stake: 100 points                      │
│ Deadline: 25/10/25                      │
│                                         │
│ [Ton War Game]                          │
└─────────────────────────────────────────┘
```

## 🔄 Flux de Données

### **1. Chargement des War Games**
```
Supabase RPC get_open_war_games() 
→ Retourne creator_address depuis users.wallet_address
→ WarGameService.transformWarGame()
→ WarGameWithDetails avec creatorAddress
→ Interface React avec affichage conditionnel
```

### **2. Détection des War Games Propres**
```
game.creatorId === supabaseUserId
→ isOwnWarGame = true
→ Style grisé + bouton désactivé
→ Message "Ton War Game"
```

## 🚀 Utilisation

### **Pour les Utilisateurs**
1. **Voir les War Games Actifs** : Liste avec adresses et heures
2. **Identifier ses War Games** : Grisés automatiquement
3. **Rejoindre les Autres** : Boutons actifs pour les war games des autres
4. **Informations Complètes** : Pseudo, adresse, date/heure, points, deadline

### **États Visuels**
- **War Game Autre** : Normal, bouton "Rejoindre ce War Game"
- **War Game Propre** : Grisé, bouton "Ton War Game"
- **Hover Normal** : Effet de survol sur les war games des autres
- **Hover Propre** : Pas d'effet de survol

## 🎯 Avantages

### **Pour les Utilisateurs**
- **Identification Claire** : Distinction visuelle entre ses war games et ceux des autres
- **Informations Complètes** : Pseudo, adresse, date/heure pour chaque war game
- **Prévention d'Erreurs** : Impossible de rejoindre ses propres war games
- **Interface Intuitive** : Feedback visuel clair

### **Pour l'Expérience**
- **Sécurité** : Empêche les actions inappropriées
- **Clarté** : Informations complètes sur chaque war game
- **Efficacité** : Identification rapide des war games disponibles
- **Cohérence** : Design uniforme avec le reste de l'application

## 🔧 Configuration Requise

### **Base de Données**
1. **Exécuter le script SQL** : `WAR_GAMES_ADD_CREATOR_ADDRESS.sql`
2. **Vérifier la fonction** : `get_open_war_games()` retourne `creator_address`
3. **Tester la requête** : Vérifier que les adresses sont bien retournées

### **Frontend**
1. **Types TypeScript** : `WarGameWithDetails` avec `creatorAddress`
2. **Service** : `WarGameService.getOpenWarGames()` avec transformation
3. **Interface** : Affichage conditionnel basé sur `isOwnWarGame`

## 🚀 Prochaines Étapes

### **Améliorations Possibles**
1. **Avatar du Créateur** : Afficher l'avatar à côté du pseudo
2. **Statut en Temps Réel** : Mise à jour automatique des war games
3. **Filtres** : Filtrer par créateur, points, date
4. **Recherche** : Rechercher par pseudo ou adresse
5. **Notifications** : Notifications pour les nouveaux war games

### **Fonctionnalités Avancées**
1. **Historique** : Voir l'historique des war games rejoints
2. **Favoris** : Marquer des créateurs comme favoris
3. **Statistiques** : Statistiques des war games créés/rejoints
4. **Chat** : Système de chat pour les war games

---

## ✅ Résumé

La mise à jour des cartes de war games améliore significativement l'expérience utilisateur en fournissant des informations complètes et en empêchant les actions inappropriées. L'interface est maintenant plus informative et sécurisée.

**Fonctionnalités Clés Implémentées :**
- ✅ Affichage du pseudo et de l'adresse du créateur
- ✅ Affichage de la date et de l'heure de création
- ✅ Grisage automatique des war games propres
- ✅ Boutons conditionnels (rejoindre vs ton war game)
- ✅ Interface responsive et thématique
- ✅ Support i18n complet (EN/FR)
- ✅ Prévention des erreurs utilisateur

**L'interface War Games est maintenant complète avec :**
1. **Informations Complètes** : Pseudo, adresse, date/heure
2. **Sécurité** : Empêche de rejoindre ses propres war games
3. **Clarté Visuelle** : Distinction claire entre ses war games et ceux des autres
4. **Expérience Utilisateur** : Interface intuitive et informative
