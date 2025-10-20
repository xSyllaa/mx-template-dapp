# 📜 Scripts Utilitaires - GalacticX

## 📁 Contenu

Ce dossier contient des scripts pour faciliter la gestion des données NFT.

---

## 🎴 extractNFTsData - Extraction des données NFT

Deux versions disponibles :
- **PowerShell** : `extractNFTsData.ps1` (recommandé pour Windows)
- **Node.js** : `extractNFTsData.js` (multiplateforme)

### Objectif

Extraire automatiquement tous les NFTs de la collection GalacticX depuis l'API MultiversX et générer un fichier JSON pré-rempli.

### Utilisation

#### PowerShell (Windows)

```powershell
# Depuis la racine du projet
.\scripts\extractNFTsData.ps1
```

#### Node.js (Multiplateforme)

```bash
# Depuis la racine du projet
node scripts/extractNFTsData.js
```

### Que fait le script ?

1. 📡 **Récupère** tous les NFTs de la collection `MAINSEASON-3db9f8`
2. 📊 **Extrait** pour chaque NFT :
   - ID séquentiel (`#1`, `#2`, etc.)
   - Nom du joueur (depuis metadata si disponible)
   - Identifiant MAINSEASON complet
   - Numéro de mint (nonce)
3. 💾 **Génère** le fichier `src/data/playersData_extracted.json`
4. 📋 **Affiche** un aperçu des données extraites

### Sortie

Le script crée le fichier : `src/data/playersData_extracted.json`

Format :
```json
[
  {
    "ID": "#1",
    "Player Name": "Ederson Santana de Moraes",
    "MAINSEASON": "MAINSEASON-3db9f8-0001",
    "MINT NR": 1
  },
  {
    "ID": "#2",
    "Player Name": "Kyle Walker",
    "MAINSEASON": "MAINSEASON-3db9f8-02e2",
    "MINT NR": 738
  }
]
```

### Workflow recommandé

1. **Exécuter le script**
   ```powershell
   .\scripts\extractNFTsData.ps1
   ```

2. **Ouvrir le fichier généré**
   ```
   src/data/playersData_extracted.json
   ```

3. **Vérifier et corriger les noms**
   
   ⚠️ Certains NFTs peuvent avoir des noms génériques :
   - `"Main Season #123"` → Remplacer par le vrai nom du joueur
   - `"NFT #456"` → Identifier le joueur manuellement
   
   Pour identifier les joueurs :
   - Chercher sur [MultiversX Explorer](https://explorer.multiversx.com)
   - Consulter la documentation officielle GalacticX
   - Vérifier les images NFT

4. **Corriger les noms spéciaux**
   
   Exemples :
   - Stadium → `"Etihad Stadium"`
   - Manager → `"Pep Guardiola"`
   - Team Emblem → `"Manchester City Emblem"`

5. **Remplacer le fichier principal**
   ```powershell
   # Une fois les corrections terminées
   Copy-Item src\data\playersData_extracted.json src\data\playersData.json
   ```

6. **Vérifier dans l'application**
   - Lancer l'app : `npm run dev`
   - Aller sur la page MyNFTs
   - Vérifier que les vrais noms s'affichent

### Exemple de correction manuelle

#### Avant (extrait automatique)
```json
{
  "ID": "#1",
  "Player Name": "Main Season #1",
  "MAINSEASON": "MAINSEASON-3db9f8-0001",
  "MINT NR": 1
}
```

#### Après (corrigé manuellement)
```json
{
  "ID": "#1",
  "Player Name": "Ederson Santana de Moraes",
  "MAINSEASON": "MAINSEASON-3db9f8-0001",
  "MINT NR": 1
}
```

---

## 🔧 Troubleshooting

### Erreur : "Cannot fetch data from API"

**Causes possibles :**
- Pas de connexion Internet
- L'API MultiversX est en maintenance
- Le collection ID est incorrect

**Solutions :**
1. Vérifier votre connexion Internet
2. Tester l'URL dans le navigateur : `https://api.multiversx.com/collections/MAINSEASON-3db9f8/nfts?size=1000`
3. Vérifier que la collection existe sur [MultiversX Explorer](https://explorer.multiversx.com)

### Erreur : "Permission denied" (PowerShell)

**Cause :** Politique d'exécution PowerShell restrictive

**Solution :**
```powershell
# Autoriser l'exécution du script (session uniquement)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Puis réessayer
.\scripts\extractNFTsData.ps1
```

### Le fichier généré est vide

**Causes possibles :**
- La collection n'a pas de NFTs
- Erreur lors du parsing JSON

**Solutions :**
1. Vérifier que la collection contient des NFTs sur l'explorer
2. Consulter les logs du script pour voir les erreurs détaillées

---

## 📚 Ressources

- **API MultiversX** : https://api.multiversx.com/docs
- **Explorer MultiversX** : https://explorer.multiversx.com
- **Documentation GalacticX** : Voir le dossier `/docs`
- **Guide Player Mapping** : `PLAYER_DATA_MAPPING_GUIDE.md`

---

## 🔮 Scripts futurs possibles

### extractPlayersStats.ps1
Extraire les statistiques des joueurs depuis Transfermarkt pour enrichir les données.

### validatePlayersData.ps1
Valider la cohérence du fichier `playersData.json` :
- Pas de doublons
- Format correct
- IDs séquentiels

### syncWithAPI.ps1
Synchroniser régulièrement les données avec l'API MultiversX pour détecter les nouveaux NFTs.

---

## 💡 Contribution

Pour ajouter un nouveau script :

1. Créer le fichier dans `scripts/`
2. Ajouter la documentation dans ce README
3. Tester sur Windows (PowerShell) et Unix (Node.js)
4. Commit avec le message : `feat: Add [script-name] utility`

---

**Dernière mise à jour** : 2025-10-20

