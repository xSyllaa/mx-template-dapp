# 💉 Système d'Injection de NFTs de Test

## Date: 2025-10-21
## Status: ✅ **OPÉRATIONNEL**

---

## 🎯 **Concept**

Un système permettant d'**injecter** les NFTs d'une autre adresse dans le cache de l'utilisateur connecté pour tester toutes les features sans changer de wallet.

---

## 🧪 **Comment ça fonctionne**

### 1. Cache Global Utilisateur

Tous les composants utilisent maintenant `useCurrentUserNFTs()` :

```typescript
// War Games, My NFTs, Dashboard, etc.
const { nfts, loading } = useCurrentUserNFTs();
```

**Clé de cache** : `['currentUserNFTs', walletAddress]`

### 2. Injection de Test

Dans **My NFTs**, tu peux injecter des NFTs d'une autre adresse :

```typescript
const { injectNFTsFromAddress } = useInjectTestNFTs();

// Injecter les NFTs de erd1xyz... dans le cache de ton wallet
await injectNFTsFromAddress('erd1xyz...');
```

**Ce qui se passe** :
1. Fetch les NFTs de `erd1xyz...` via API
2. **Injecte** ces NFTs dans le cache de TON wallet
3. Tous les composants voient maintenant ces NFTs
4. War Games, Dashboard, etc. utilisent ces NFTs "fakés"

### 3. Reset

Pour revenir à tes vrais NFTs :

```typescript
const { resetToWalletNFTs } = useInjectTestNFTs();
await resetToWalletNFTs();
```

---

## 📱 **Interface Utilisateur**

### My NFTs Page - Mode Test

```
🧪 Tester avec une adresse
  ┌───────────────────────────────────────────────────┐
  │ 🧪 Mode Test - Injection de NFTs                 │
  │                                                   │
  │ Récupère les NFTs d'une autre adresse et les     │
  │ injecte dans le cache de ton wallet.              │
  │                                                   │
  │ ┌───────────────────┐  ┌─────────┐  ┌────────┐  │
  │ │ erd1z563juvyfl... │  │💉Injecter│  │🔄Reset │  │
  │ └───────────────────┘  └─────────┘  └────────┘  │
  │                                                   │
  │ ⚠️ Attention: Les NFTs injectés remplaceront     │
  │ temporairement tes vrais NFTs dans toutes les    │
  │ features. Utilise "Reset" pour revenir.          │
  └───────────────────────────────────────────────────┘
```

### Boutons

1. **💉 Injecter** - Fetch et injecte les NFTs
   - Loading: "💉 Injection..."
   - Désactivé pendant le fetch

2. **🔄 Reset** - Revient aux vrais NFTs du wallet
   - Invalide le cache
   - Refetch automatique

---

## 🔄 **Flow Complet**

### Scénario: Tester War Games avec beaucoup de NFTs

```
1. User connecte son wallet (erd1abc... - 5 NFTs)
   │
2. Va sur My NFTs
   ├─ useCurrentUserNFTs() fetch
   ├─ Cache: ['currentUserNFTs', 'erd1abc...'] = 5 NFTs
   └─ Affiche: 5 NFTs
   │
3. Active le mode test
   ├─ Clique "🧪 Tester avec une adresse"
   └─ Entre: erd1z563juvyfl... (200 NFTs)
   │
4. Clique "💉 Injecter"
   ├─ Fetch NFTs de erd1z563juvyfl...
   ├─ Reçoit: 200 NFTs
   ├─ INJECTE dans cache de erd1abc...
   ├─ Cache: ['currentUserNFTs', 'erd1abc...'] = 200 NFTs ✅
   └─ Affiche: 200 NFTs (comme si le user les possédait)
   │
5. Va sur War Games
   ├─ useCurrentUserNFTs() lit le cache
   ├─ Cache HIT: ['currentUserNFTs', 'erd1abc...']
   └─ 200 NFTs disponibles pour créer team! ✅
   │
6. Teste création de War Game
   ├─ Team builder avec 200 NFTs
   └─ Peut tester toutes les combinaisons
   │
7. Clique "🔄 Reset" dans My NFTs
   ├─ Invalide cache
   ├─ Refetch vrais NFTs de erd1abc...
   └─ Revient à 5 NFTs
```

---

## 💻 **Implémentation**

### Hook: useCurrentUserNFTs()

**Fichier**: `src/features/collection/hooks/useCurrentUserNFTs.ts`

```typescript
export const useCurrentUserNFTs = () => {
  const { address } = useGetAccount();
  
  const { data } = useQuery({
    queryKey: ['currentUserNFTs', address],
    queryFn: () => fetchUserNFTs(address, true),
    enabled: !!address,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  
  return {
    nfts: data?.nfts || [],
    // ...
  };
};
```

### Hook: useInjectTestNFTs()

```typescript
export const useInjectTestNFTs = () => {
  const queryClient = useQueryClient();
  const { address } = useGetAccount();
  
  const injectNFTsFromAddress = async (testAddress: string) => {
    // 1. Fetch NFTs from test address
    const result = await fetchUserNFTs(testAddress, true);
    
    // 2. Inject into current user's cache
    queryClient.setQueryData(
      ['currentUserNFTs', address],
      result
    );
  };
  
  const resetToWalletNFTs = async () => {
    // Invalidate cache to refetch real NFTs
    await queryClient.invalidateQueries({ 
      queryKey: ['currentUserNFTs', address] 
    });
  };
  
  return { injectNFTsFromAddress, resetToWalletNFTs };
};
```

---

## 📋 **Pages Utilisant le Cache**

### ✅ My NFTs
```typescript
import { useCurrentUserNFTs, useInjectTestNFTs } from 'features/collection';

const { nfts } = useCurrentUserNFTs();
const { injectNFTsFromAddress } = useInjectTestNFTs();
```

**Features**:
- Affiche les NFTs du cache
- Bouton injection de test
- Bouton reset

### ✅ War Games
```typescript
import { useCurrentUserNFTs } from 'features/collection';

const { nfts, loading } = useCurrentUserNFTs();
```

**Behavior**:
- Utilise automatiquement les NFTs du cache
- Si NFTs injectés → Utilise les NFTs injectés
- Si pas d'injection → Utilise les vrais NFTs

### Autres Features

Toute feature ayant besoin des NFTs de l'utilisateur doit utiliser :
```typescript
const { nfts } = useCurrentUserNFTs();
```

---

## 🎯 **Avantages**

1. ✅ **Une source de vérité** - Tous les composants utilisent le même cache
2. ✅ **Tests faciles** - Injecte n'importe quel wallet pour tester
3. ✅ **Pas de changement de wallet** - Reste connecté à ton wallet
4. ✅ **Global** - War Games, Dashboard, etc. utilisent automatiquement les NFTs injectés
5. ✅ **Reversible** - Reset pour revenir aux vrais NFTs
6. ✅ **Cache intelligent** - 1 heure de durée, refresh manuel possible

---

## 📊 **Exemples d'Utilisation**

### Tester War Games avec beaucoup de NFTs

```
Problem: Mon wallet a seulement 3 NFTs, impossible de créer une team de 11

Solution:
1. Va sur My NFTs
2. Clique "🧪 Tester avec une adresse"
3. Entre: erd1z563juvyfl... (wallet avec 200 NFTs)
4. Clique "💉 Injecter"
5. ✅ Tu as maintenant 200 NFTs
6. Va sur War Games → Crée ta team de 11 NFTs!
7. Teste toutes les fonctionnalités
8. Reset quand terminé
```

### Tester avec différentes raretés

```
1. Injecte wallet A (beaucoup de Common)
   → Teste comportement avec Common
   
2. Reset

3. Injecte wallet B (beaucoup de Legendary)
   → Teste comportement avec Legendary
```

---

## ⚠️ **Important - Mode Dev Seulement**

Ce système est **uniquement pour le développement/testing**.

**À NE PAS faire en production** :
- ❌ Ne pas exposer cette fonctionnalité aux utilisateurs finaux
- ❌ Ne pas persister l'injection (refresh page = reset)
- ❌ Ne pas utiliser pour contourner la sécurité

**Pour production** :
- Retirer ou cacher le bouton "🧪 Tester avec une adresse"
- Ou ajouter un flag d'environnement :
  ```typescript
  {process.env.NODE_ENV === 'development' && (
    <button>🧪 Tester avec une adresse</button>
  )}
  ```

---

## 🔧 **Logs Console**

Quand tu injectes des NFTs, tu verras :

```
🧪 [TEST MODE] Fetching NFTs from erd1z563juvyfl...
✅ [TEST MODE] Fetched 200 NFTs from test address
💉 [TEST MODE] Injecting into cache for current user (erd1abc...)
✅ [TEST MODE] NFTs injected successfully!
⚠️  [TEST MODE] War Games and other features will now use these 200 NFTs
```

Quand tu reset :

```
🔄 [TEST MODE] Resetting to actual wallet NFTs for erd1abc...
✅ [TEST MODE] Reset complete - showing real wallet NFTs
```

---

## 📝 **Fichiers de l'Implémentation**

### Nouveaux
- `src/features/collection/hooks/useCurrentUserNFTs.ts` - Hook principal + injection

### Modifiés
- `src/pages/MyNFTs/MyNFTs.tsx` - UI d'injection
- `src/pages/WarGames/WarGames.tsx` - Utilise useCurrentUserNFTs
- `src/features/collection/hooks/index.ts` - Exports
- `src/features/collection/index.ts` - Exports
- `src/App.tsx` - Nettoyé (TestAddressContext retiré)
- `src/contexts/index.ts` - Nettoyé

### Supprimés
- `src/contexts/TestAddressContext.tsx` - Remplacé par injection directe

---

## ✅ **Résultat**

**Architecture Simple et Puissante** :
- ✅ 1 cache global par utilisateur
- ✅ Tous les composants utilisent ce cache
- ✅ Mode test par injection (dev only)
- ✅ Reset facile vers vrais NFTs
- ✅ Logs clairs pour debugging

**Prêt à tester !** 🚀

---

**Date**: 2025-10-21  
**Version**: Final

