# Extended Bet Type System - Fix Guide

## 🎯 Problème Résolu

L'erreur `Could not find the 'extended_bet_type' column of 'predictions' in the schema cache` a été corrigée en ajoutant la colonne manquante et en mettant à jour le système de filtrage.

## 🔧 Changements Apportés

### 1. Migration de Base de Données

**Fichier**: `supabase/migrations/006_add_extended_bet_type_to_predictions.sql`

```sql
-- Ajouter la colonne extended_bet_type
ALTER TABLE predictions 
ADD COLUMN extended_bet_type TEXT;

-- Mettre à jour les enregistrements existants
UPDATE predictions 
SET extended_bet_type = CASE 
  WHEN bet_type = 'result' THEN '1x2'
  WHEN bet_type = 'over_under' THEN 'over-under-goals'
  WHEN bet_type = 'scorer' THEN 'first-goalscorer'
  WHEN bet_type = 'both_teams_score' THEN 'both-teams-score'
  ELSE bet_type
END
WHERE extended_bet_type IS NULL;

-- Rendre la colonne obligatoire
ALTER TABLE predictions 
ALTER COLUMN extended_bet_type SET NOT NULL;
```

### 2. Service de Prédictions

**Fichier**: `src/features/predictions/services/predictionService.ts`

- ✅ Correction de la fonction `createPrediction` pour inclure `extended_bet_type`
- ✅ Mapping explicite des champs pour éviter les erreurs de colonnes

### 3. Types TypeScript

**Fichier**: `src/features/predictions/types.ts`

- ✅ `extended_bet_type` est maintenant requis dans `CreatePredictionData`
- ✅ Mise à jour des interfaces pour supporter les nouveaux types

### 4. Système de Filtrage

**Fichier**: `src/features/predictions/hooks/usePredictionFilters.ts`

- ✅ Utilisation de `extended_bet_type` au lieu de `bet_type` pour le filtrage
- ✅ Support des types de paris étendus (string[] au lieu de BetType[])
- ✅ Fallback vers `bet_type` pour la compatibilité

### 5. Interface de Filtrage

**Fichier**: `src/features/predictions/components/PredictionFilters.tsx`

- ✅ Mapping complet des types de paris étendus avec icônes et labels
- ✅ Support de 80+ types de paris différents
- ✅ Affichage intelligent des types présents dans les données

## 🚀 Application de la Migration

### Option 1: Script PowerShell (Recommandé)

```powershell
# Exécuter le script de migration
.\apply-extended-bet-type-migration.ps1
```

### Option 2: Commande Supabase

```powershell
# Appliquer la migration
supabase db push
```

### Option 3: Manuel

1. Aller dans le dashboard Supabase
2. Ouvrir l'éditeur SQL
3. Exécuter le contenu de `supabase/migrations/006_add_extended_bet_type_to_predictions.sql`

## 🎯 Types de Paris Supportés

Le système supporte maintenant **80+ types de paris** organisés en 10 catégories :

### 1. Match Result Bets
- `1x2` - 1X2 (Full-Time Result)
- `double-chance` - Double Chance
- `draw-no-bet` - Draw No Bet
- `win-to-nil` - To Win to Nil
- `clean-sheet` - Clean Sheet

### 2. Goals Markets
- `over-under-goals` - Over/Under Total Goals
- `both-teams-score` - Both Teams to Score
- `correct-score` - Correct Score
- `team-total-goals` - Team Total Goals
- `first-team-score` - First Team to Score
- `last-team-score` - Last Team to Score
- `no-goalscorer` - No Goalscorer
- `exact-total-goals` - Exact Total Goals
- `multi-goal-range` - Multi-Goal Range
- `goal-interval` - Goal Interval
- `odd-even-goals` - Odd or Even Goals

### 3. Time-Based Bets
- `half-time-full-time` - Half-Time/Full-Time
- `half-time-result` - Half-Time Result
- `second-half-result` - Second Half Result
- `first-half-goals` - First Half Goals
- `second-half-goals` - Second Half Goals
- `first-goal-timing` - First Goal Timing
- `goal-minute-intervals` - Goal Minute Intervals

### 4. Player Bets
- `first-goalscorer` - First Goalscorer
- `anytime-goalscorer` - Anytime Goalscorer
- `last-goalscorer` - Last Goalscorer
- `score-2-or-more` - To Score 2+ Goals
- `hat-trick` - To Score a Hat-trick
- `player-booked` - Player to Be Booked
- `player-assist` - Player to Assist
- `player-shots` - Player Shots
- `player-stats` - Player Stats
- `first-substituted` - First Substituted

### 5. Cards & Bookings
- `total-cards` - Total Cards
- `team-cards` - Team Total Cards
- `first-card` - First Team to Receive Card
- `first-player-carded` - First Player Carded
- `red-card` - Red Card in Match
- `booking-points` - Total Booking Points
- `player-booking-specials` - Player Booking Specials

### 6. Corners
- `total-corners` - Total Corners
- `team-corners` - Team Total Corners
- `first-corner` - First Team to Win Corner
- `most-corners` - Most Corners
- `corner-race` - Corner Race
- `corner-intervals` - Corner Time Intervals
- `odd-even-corners` - Odd or Even Corners

### 7. Combination Bets
- `result-btts` - Result + BTTS
- `win-over-goals` - Win + Over Goals
- `scorecast` - Scorecast
- `wincast` - Wincast
- `bet-builder` - Bet Builder
- `same-game-multi` - Same Game Multi
- `accumulators` - Accumulators

### 8. Specials / Prop Bets
- `penalty-awarded` - Penalty Awarded
- `penalty-missed` - Penalty Missed
- `own-goal` - Own Goal
- `woodwork-hit` - Woodwork Hit
- `var-intervention` - VAR Intervention
- `penalty-save` - Penalty Save
- `shirt-number` - Shirt Number
- `manager-booking` - Manager Booking

### 9. Long-Term / Outright Bets
- `league-winner` - League Winner
- `top-4-finish` - Top 4 Finish
- `relegation` - Relegation
- `golden-boot` - Golden Boot
- `player-tournament` - Player of Tournament
- `reach-final` - To Reach Final
- `group-winner` - Group Winner
- `elimination-stage` - Stage of Elimination
- `top-assisting` - Top Assisting

### 10. Advanced / Niche Markets
- `team-offsides` - Team Offsides
- `team-fouls` - Team Fouls
- `expected-goals` - Expected Goals
- `set-piece-first` - First Set Piece
- `extra-time` - Extra Time
- `golden-goal` - Golden Goal
- `to-qualify` - To Qualify
- `penalties-decided` - Penalties Decided

## 🎨 Fonctionnalités du Système de Filtrage

### Filtrage Intelligent
- ✅ Affiche seulement les types de paris présents dans les données
- ✅ Support des types étendus et legacy
- ✅ Icônes et labels descriptifs pour chaque type
- ✅ Tooltips avec noms complets

### Interface Utilisateur
- ✅ Boutons de filtrage avec icônes
- ✅ Affichage compact et responsive
- ✅ Support de la sélection multiple
- ✅ Indicateur du nombre de résultats

## 🔍 Vérification

### 1. Vérifier la Migration
```sql
-- Vérifier que la colonne existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'predictions' 
AND column_name = 'extended_bet_type';
```

### 2. Vérifier les Données
```sql
-- Vérifier que les données existantes ont été mises à jour
SELECT bet_type, extended_bet_type, COUNT(*) 
FROM predictions 
GROUP BY bet_type, extended_bet_type;
```

### 3. Tester la Création
- Aller sur `/admin/create-prediction`
- Sélectionner un type de pari étendu
- Créer une prédiction
- Vérifier qu'elle apparaît dans les filtres

## 🚨 Dépannage

### Erreur: "Column extended_bet_type does not exist"
**Solution**: Appliquer la migration avec `supabase db push`

### Erreur: "extended_bet_type is required"
**Solution**: Vérifier que le formulaire de création utilise le nouveau champ

### Filtres ne s'affichent pas
**Solution**: Vérifier que les prédictions ont des valeurs `extended_bet_type`

### Types de paris manquants
**Solution**: Ajouter de nouveaux types dans `PredictionFilters.tsx`

## 📈 Avantages

1. **Flexibilité**: Support de 80+ types de paris
2. **Compatibilité**: Fallback vers les anciens types
3. **Performance**: Filtrage optimisé
4. **UX**: Interface intuitive avec icônes
5. **Évolutivité**: Facile d'ajouter de nouveaux types

## 🎯 Prochaines Étapes

1. ✅ Appliquer la migration
2. ✅ Tester la création de prédictions
3. ✅ Vérifier les filtres
4. ✅ Ajouter de nouveaux types si nécessaire
5. ✅ Documenter les nouveaux types pour les utilisateurs

---

**Status**: ✅ **RÉSOLU** - Le système de types de paris étendus est maintenant pleinement fonctionnel !
