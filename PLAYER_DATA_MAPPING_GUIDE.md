# 🎴 Player Data Mapping System - Guide Complet

## 📋 Vue d'ensemble

Ce système permet de mapper les NFTs GalacticX à leurs vrais noms de joueurs et de créer des liens directs vers Transfermarkt pour chaque joueur.

## 🏗 Architecture

### Fichiers créés/modifiés

1. **`src/data/playersData.json`** - Base de données des joueurs
2. **`src/data/playerDataService.ts`** - Service de mapping et utilitaires
3. **`src/features/myNFTs/types.ts`** - Type `GalacticXNFT` enrichi avec `realPlayerName`
4. **`src/features/myNFTs/services/nftService.ts`** - Enrichissement automatique des NFTs
5. **`src/features/myNFTs/components/NFTCard.tsx`** - Affichage du vrai nom
6. **`src/features/myNFTs/components/NFTDetailModal.tsx`** - Modal avec lien Transfermarkt

---

## 📊 Structure des données

### Format `playersData.json`

```json
[
  {
    "ID": "#1",
    "Player Name": "Ederson Santana de Moraes",
    "MAINSEASON": "",
    "MINT NR": ""
  },
  {
    "ID": "#2",
    "Player Name": "Kyle Walker",
    "MAINSEASON": "MAINSEASON-3db9f8-02e2",
    "MINT NR": 738
  },
  {
    "ID": "#3",
    "Player Name": "Ruben Diaz",
    "MAINSEASON": "MAINSEASON-3db9f8-04e8",
    "MINT NR": 1256
  }
]
```

### Champs

- **`ID`** : Identifiant unique au format `#1`, `#2`, etc.
- **`Player Name`** : Nom complet réel du joueur
- **`MAINSEASON`** : Identifiant MultiversX du NFT (format `MAINSEASON-3db9f8-XXXX`)
- **`MINT NR`** : Numéro de mint (nonce en décimal)

---

## 🔧 Fonctionnalités

### 1. Mapping automatique

Le service `playerDataService` offre plusieurs méthodes de recherche :

```typescript
// Par nonce (numéro de mint)
getPlayerDataByNFT(738); // → Kyle Walker

// Par ID
getPlayerDataByNFT("#2"); // → Kyle Walker

// Par identifiant MAINSEASON
getPlayerDataByIdentifier("MAINSEASON-3db9f8-02e2"); // → Kyle Walker

// Recherche intelligente multi-méthode
getRealPlayerName({
  identifier: "MAINSEASON-3db9f8-02e2",
  nonce: 738,
  name: "Main Season #2"
}); // → "Kyle Walker"
```

### 2. Génération d'URL Transfermarkt

Le service génère automatiquement des URLs de recherche Transfermarkt :

```typescript
getTransfermarktURL("Kyle Walker");
// → "https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=kyle-walker"

getTransfermarktURL("Ederson Santana de Moraes");
// → "https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=ederson-santana-de-moraes"
```

**Normalisation automatique** :
- Conversion en minuscules
- Suppression des accents
- Remplacement des espaces par des tirets
- Suppression des caractères spéciaux

---

## 🎨 Affichage dans l'UI

### NFTCard (Carte NFT)

- Affiche le **vrai nom du joueur** s'il est disponible
- Affiche le nom original en petit texte gris en dessous
- Fallback sur le nom NFT si pas de mapping trouvé

### NFTDetailModal (Modal de détail)

- Titre principal : **vrai nom du joueur**
- Sous-titre : nom original du NFT
- Bouton **"View on Transfermarkt"** : 
  - Visible uniquement si un vrai nom est trouvé
  - Redirige vers la page de recherche Transfermarkt du joueur

---

## ➕ Ajouter un nouveau joueur

### Étapes

1. Ouvrez `src/data/playersData.json`

2. Ajoutez une nouvelle entrée :

```json
{
  "ID": "#4",
  "Player Name": "John Stones",
  "MAINSEASON": "MAINSEASON-3db9f8-XXXX",
  "MINT NR": 1234
}
```

3. **Comment trouver les valeurs** :

#### Méthode 1 : Via MultiversX Explorer

1. Allez sur [explorer.multiversx.com](https://explorer.multiversx.com)
2. Cherchez le NFT par son identifiant
3. Dans l'URL ou les détails, trouvez :
   - **Identifier** : `MAINSEASON-3db9f8-XXXX` (XXXX est en hexadécimal)
   - **Nonce** : Numéro décimal du mint

#### Méthode 2 : Via l'API MultiversX

```bash
# Récupérer les NFTs d'un wallet
curl https://api.multiversx.com/accounts/{WALLET_ADDRESS}/nfts?search=MAINSEASON-3db9f8
```

4. L'**ID** suit la séquence numérique (`#1`, `#2`, `#3`, etc.)

5. Sauvegardez le fichier ✅

### Cas particuliers

#### NFT sans joueur (Stadium, Manager, etc.)

Si c'est une carte spéciale (Stadium, Team Emblem, etc.), vous pouvez :

- **Option 1** : Ne pas l'ajouter (le système utilisera le nom NFT par défaut)
- **Option 2** : Ajouter un nom descriptif :

```json
{
  "ID": "#50",
  "Player Name": "Etihad Stadium",
  "MAINSEASON": "MAINSEASON-3db9f8-YYYY",
  "MINT NR": 5678
}
```

#### NFT avec plusieurs variantes

Si un joueur a plusieurs cartes :

```json
{
  "ID": "#10",
  "Player Name": "Erling Haaland",
  "MAINSEASON": "MAINSEASON-3db9f8-AAAA",
  "MINT NR": 100
},
{
  "ID": "#11",
  "Player Name": "Erling Haaland (Special)",
  "MAINSEASON": "MAINSEASON-3db9f8-BBBB",
  "MINT NR": 200
}
```

---

## 🔍 Débogage

### Vérifier si un NFT a un mapping

Ouvrez la console du navigateur et cherchez les logs :

```
🎴 NFT Fetch Results for erd1...
📊 Total raw NFTs: 10
✅ Valid NFTs: 10
```

Puis inspectez un NFT dans la console :

```javascript
// Dans la console du navigateur
console.log(nfts[0].realPlayerName); // "Kyle Walker" ou undefined
```

### NFT non trouvé

Si un NFT n'a pas de `realPlayerName`, vérifiez :

1. **L'ID dans playersData.json correspond au nonce ?**
2. **L'identifiant MAINSEASON est correct ?**
3. **Le format de l'ID est bien `#123` ?**

### Test manuel du service

Dans la console :

```javascript
import { getRealPlayerName } from './data/playerDataService';

getRealPlayerName({
  identifier: "MAINSEASON-3db9f8-02e2",
  nonce: 738,
  name: "Main Season #2"
});
// → "Kyle Walker"
```

---

## 🚀 Workflow recommandé

### Pour ajouter une collection complète

1. **Exportez** la liste complète des NFTs depuis l'API MultiversX

```bash
curl "https://api.multiversx.com/collections/MAINSEASON-3db9f8/nfts?size=1000" > nfts.json
```

2. **Parsez** le JSON pour extraire :
   - Nonce (décimal)
   - Identifier
   - Name (si disponible dans metadata)

3. **Complétez** avec les vrais noms des joueurs (manuellement ou via scraping)

4. **Formatez** au format `playersData.json`

5. **Testez** avec quelques NFTs dans l'app

---

## 📝 Notes techniques

### Performance

- Le fichier JSON est chargé **une seule fois** au démarrage
- Les recherches sont en **O(n)** sur la liste des joueurs
- Pour de très grandes collections (>1000 joueurs), envisager un Map/Object

### Compatibilité

- ✅ Fonctionne avec **MyNFTs**
- ✅ Fonctionne avec **War Games** (includeErrors mode)
- ✅ Compatible avec tous les thèmes

### Évolutions futures possibles

1. **API externe** : Remplacer le JSON par un appel API
2. **Cache** : Mettre en cache les résultats de recherche
3. **Fuzzy search** : Recherche approximative pour gérer les erreurs
4. **Multilingual** : Noms de joueurs dans différentes langues
5. **Stats enrichies** : Ajouter des stats Transfermarkt (âge, valeur, etc.)

---

## ✅ Checklist de vérification

Avant de commiter :

- [ ] Le fichier `playersData.json` est valide (pas d'erreur de syntaxe JSON)
- [ ] Tous les IDs sont uniques
- [ ] Les noms de joueurs sont correctement orthographiés
- [ ] Les identifiants MAINSEASON sont corrects
- [ ] Les MINT NR correspondent aux nonces
- [ ] Aucune erreur de linting
- [ ] L'app démarre sans erreur
- [ ] Les NFTs s'affichent correctement dans MyNFTs
- [ ] Les liens Transfermarkt fonctionnent

---

## 🆘 Support

En cas de problème :

1. Vérifiez les logs de la console
2. Vérifiez le format JSON
3. Testez le service `playerDataService` manuellement
4. Consultez ce guide

---

**🎉 Profitez du système de mapping des joueurs !**

