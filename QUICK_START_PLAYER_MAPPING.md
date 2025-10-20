# ⚡ Quick Start - Player Name Mapping

## 🎯 En 30 secondes

Le système est **déjà fonctionnel** avec 3 joueurs d'exemple !

### Voir le résultat immédiatement

```powershell
npm run dev
```

Allez sur **MyNFTs** → Vos NFTs afficheront les vrais noms des joueurs (si mappés).

---

## ➕ Ajouter un nouveau joueur (1 minute)

### Option 1 : Manuel (rapide)

1. Ouvrez `src/data/playersData.json`
2. Ajoutez une ligne :

```json
{
  "ID": "#4",
  "Player Name": "John Stones",
  "MAINSEASON": "MAINSEASON-3db9f8-XXXX",
  "MINT NR": 1234
}
```

3. Sauvegardez → C'est tout ! ✅

### Option 2 : Script automatique (pour tous les NFTs)

```powershell
# Extraire tous les NFTs de la collection
.\scripts\extractNFTsData.ps1

# Ouvrir le fichier généré
# src/data/playersData_extracted.json

# Corriger les noms manuellement

# Remplacer le fichier principal
Copy-Item src\data\playersData_extracted.json src\data\playersData.json
```

---

## 📖 Où trouver les infos ?

### MAINSEASON identifier

Sur [MultiversX Explorer](https://explorer.multiversx.com) :
- Cherchez le NFT
- Copiez l'identifier (format : `MAINSEASON-3db9f8-XXXX`)

### MINT NR (nonce)

C'est le numéro visible dans les détails du NFT sur l'explorer.

---

## 🎨 Résultat visuel

### Avant
```
Main Season #2
Position: DEF
```

### Après
```
Kyle Walker          ← Vrai nom ✅
Main Season #2       ← Nom original
Position: DEF
```

### + Lien Transfermarkt automatique 🔗

---

## 📚 Documentation complète

- **Guide complet** : `PLAYER_DATA_MAPPING_GUIDE.md`
- **Implémentation** : `MYNFTS_PLAYER_MAPPING_IMPLEMENTATION.md`
- **Scripts** : `scripts/README.md`

---

## ✅ Checklist

- [x] Système installé et fonctionnel
- [x] 3 joueurs d'exemple mappés
- [ ] Ajouter vos joueurs dans `playersData.json`
- [ ] Tester dans l'app
- [ ] Profiter ! 🎉

---

**Temps total : 1-5 minutes**  
**Difficulté : 🟢 Facile**

