# 🎯 Système de Gestion de Pseudo - Documentation Complète

## 📋 Vue d'ensemble

Le système de gestion de pseudo (username) permet aux utilisateurs de GalacticX de personnaliser leur identité dans l'application. Le pseudo est **unique**, **sécurisé**, et modifiable avec une **limite de 7 jours** entre chaque modification.

---

## 🔐 Sécurité

### Politiques RLS (Row Level Security)

Le système est entièrement sécurisé au niveau de la base de données PostgreSQL via Supabase :

#### 1. **Politique de Mise à Jour Non-Sensible**
```sql
CREATE POLICY "Users can update own profile (non-username)"
```
- Permet aux utilisateurs de modifier leurs propres champs NON-SENSIBLES
- **Empêche** la modification du username via cette politique
- Vérifie que `auth.uid() = id`

#### 2. **Politique de Mise à Jour du Username**
```sql
CREATE POLICY "Users can update own username with cooldown"
```
- Permet la modification du username **uniquement si** :
  - L'utilisateur est le propriétaire (`auth.uid() = id`)
  - ET le cooldown de 7 jours est passé (`can_update_username(id)`)
- Double vérification dans `USING` et `WITH CHECK`

#### 3. **Fonction de Vérification du Cooldown**
```sql
CREATE OR REPLACE FUNCTION can_update_username(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      username_last_modified IS NULL OR 
      username_last_modified < NOW() - INTERVAL '7 days',
      TRUE
    )
    FROM users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
- `SECURITY DEFINER` : S'exécute avec les privilèges du créateur (admin)
- Vérifie uniquement le cooldown, **pas l'identité** (fait par RLS)

#### 4. **Trigger de Mise à Jour du Timestamp**
```sql
CREATE TRIGGER set_username_last_modified
BEFORE UPDATE ON users
FOR EACH ROW
WHEN (NEW.username IS DISTINCT FROM OLD.username)
EXECUTE FUNCTION update_username_timestamp();
```
- Met automatiquement à jour `username_last_modified` lors du changement
- Impossible de contourner manuellement

### Protection Contre les Attaques

| Type d'Attaque | Protection |
|----------------|------------|
| **Modification du pseudo d'un autre utilisateur** | ❌ Bloqué par RLS (`auth.uid() = id`) |
| **Bypass du cooldown** | ❌ Bloqué par `can_update_username()` + RLS |
| **Usurpation de pseudo** | ❌ Contrainte `UNIQUE` sur username |
| **Caractères malveillants** | ❌ Validation regex côté client + contrainte UNIQUE |
| **SQL Injection** | ❌ Parameterized queries + RLS |
| **Modification manuelle du timestamp** | ❌ Trigger automatique |

---

## 📁 Architecture des Fichiers

### Nouveaux Fichiers Créés

```
USERNAME_SYSTEM_MIGRATION.sql                     # Migration SQL
src/features/username/
├── types.ts                                      # Types TypeScript
├── services/
│   └── usernameService.ts                        # Logique métier
├── hooks/
│   └── useUsername.ts                            # Hook React
├── components/
│   ├── UsernameEditor.tsx                        # Composant d'édition
│   └── index.ts                                  # Exports
└── index.ts                                      # Public API
```

### Fichiers Modifiés

```
src/hooks/useUserRole.ts                          # +username_last_modified
src/components/Sidebar/Sidebar.tsx               # Affichage + bouton edit
src/features/leaderboard/components/LeaderboardEntry.tsx  # Affichage @username
src/i18n/locales/en.json                          # Traductions EN
src/i18n/locales/fr.json                          # Traductions FR
```

---

## 🚀 Installation et Déploiement

### 1. Migration Base de Données

**⚠️ IMPORTANT : Exécuter dans Supabase Dashboard → SQL Editor**

```powershell
# Ouvrir le fichier
Get-Content USERNAME_SYSTEM_MIGRATION.sql
```

Copier le contenu et l'exécuter dans Supabase SQL Editor.

### 2. Vérification

Vérifier que tout est bien créé :

```sql
-- Vérifier la colonne
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'username_last_modified';

-- Vérifier la contrainte UNIQUE
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'users' AND constraint_type = 'UNIQUE';

-- Vérifier la fonction
SELECT proname FROM pg_proc WHERE proname = 'can_update_username';

-- Vérifier les politiques RLS
SELECT policyname FROM pg_policies WHERE tablename = 'users';
```

### 3. Test de Sécurité

Tester les différents scénarios :

```sql
-- Test 1: Modifier son propre username (première fois)
UPDATE users SET username = 'test123' WHERE id = auth.uid();
-- ✅ Devrait fonctionner

-- Test 2: Modifier immédiatement après
UPDATE users SET username = 'test456' WHERE id = auth.uid();
-- ❌ Devrait échouer (cooldown)

-- Test 3: Modifier le username d'un autre utilisateur
UPDATE users SET username = 'hacker' WHERE id = '<autre_user_id>';
-- ❌ Devrait échouer (RLS)

-- Test 4: Utiliser un username déjà pris
UPDATE users SET username = 'existing_user' WHERE id = auth.uid();
-- ❌ Devrait échouer (UNIQUE constraint)
```

---

## 💻 Utilisation dans le Code

### Service Layer (usernameService.ts)

#### Valider un Username
```typescript
import { validateUsername } from 'features/username';

const validation = validateUsername('john-doe-123');
if (!validation.isValid) {
  console.error(validation.error); // 'username.validation.tooShort', etc.
}
```

#### Vérifier la Disponibilité
```typescript
import { checkUsernameAvailability } from 'features/username';

const availability = await checkUsernameAvailability('john-doe', userId);
if (!availability.isAvailable) {
  console.error(availability.error); // 'username.validation.taken'
}
```

#### Vérifier le Cooldown
```typescript
import { canUpdateUsername } from 'features/username';

const cooldown = await canUpdateUsername(userId);
if (!cooldown.canUpdate) {
  console.log(`Wait ${cooldown.daysRemaining} more days`);
}
```

#### Mettre à Jour le Username
```typescript
import { updateUsername } from 'features/username';

const result = await updateUsername(userId, 'new-username');
if (result.success) {
  console.log('Updated successfully!');
} else {
  console.error(result.error);
}
```

### Hook Layer (useUsername.ts)

```typescript
import { useUsername } from 'features/username';

const MyComponent = () => {
  const {
    canUpdate,           // boolean - Si l'user peut modifier
    nextAvailableDate,   // Date | undefined - Prochaine date dispo
    daysRemaining,       // number | undefined - Jours restants
    isUpdating,          // boolean - État de chargement
    error,               // string | null - Message d'erreur
    updateUsername,      // (username: string) => Promise<void>
    refreshCooldown      // () => Promise<void> - Recharger le cooldown
  } = useUsername({
    userId: user.id,
    onSuccess: () => showToast('Success!', 'success'),
    onError: (err) => showToast(err, 'error')
  });

  // Utilisation
  const handleSubmit = () => {
    if (canUpdate) {
      updateUsername('new-username');
    }
  };
};
```

### Component Layer (UsernameEditor.tsx)

```typescript
import { UsernameEditor } from 'features/username';

const Sidebar = () => {
  const [showEditor, setShowEditor] = useState(false);
  const { userProfile } = useUserRole();

  return (
    <>
      <button onClick={() => setShowEditor(true)}>Edit Username</button>
      
      {showEditor && userProfile && (
        <UsernameEditor
          userId={userProfile.id}
          currentUsername={userProfile.username}
          onClose={() => setShowEditor(false)}
          onSuccess={() => {
            // useUserRole se rafraîchit automatiquement
            setShowEditor(false);
          }}
        />
      )}
    </>
  );
};
```

---

## 🎨 Règles de Validation

### Regex
```typescript
/^[a-zA-Z0-9-]+$/
```

### Contraintes

| Règle | Valeur | Message d'Erreur |
|-------|--------|------------------|
| **Longueur min** | 3 caractères | `username.validation.tooShort` |
| **Longueur max** | 20 caractères | `username.validation.tooLong` |
| **Caractères autorisés** | a-z, A-Z, 0-9, - | `username.validation.invalidChars` |
| **Ne peut pas commencer/finir par `-`** | - | `username.validation.invalidChars` |
| **Unicité** | Base de données | `username.validation.taken` |

### Exemples

| Username | Valide ? | Raison |
|----------|----------|--------|
| `john` | ✅ | Valide |
| `john-doe-123` | ✅ | Valide |
| `John_Doe` | ❌ | Underscore non autorisé |
| `john doe` | ❌ | Espace non autorisé |
| `-john` | ❌ | Commence par `-` |
| `ab` | ❌ | Trop court (< 3) |
| `a-very-long-username-over-twenty` | ❌ | Trop long (> 20) |
| `john@doe` | ❌ | Caractère spécial `@` |

---

## 🌍 Internationalisation (i18n)

### Clés de Traduction

```json
{
  "username": {
    "label": "Username",
    "placeholder": "Choose a username",
    "edit": "Edit Username",
    "save": "Save",
    "cancel": "Cancel",
    "validation": {
      "tooShort": "Username must be at least 3 characters",
      "tooLong": "Username must be at most 20 characters",
      "invalidChars": "Only letters, numbers, and hyphens allowed",
      "taken": "This username is already taken",
      "required": "Username is required",
      "available": "Username available"
    },
    "cooldown": {
      "active": "You can change your username again in {{days}} days",
      "available": "You can change your username"
    },
    "success": "Username updated successfully!",
    "error": "Failed to update username"
  }
}
```

### Utilisation avec Variables

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Simple
t('username.label');  // "Username"

// Avec variable
t('username.cooldown.active', { days: 5 });  // "You can change your username again in 5 days"
```

---

## 📊 Affichage du Username

### Sidebar
- **Avec username** : `👤 @john-doe` + bouton ✏️
- **Sans username** : `👛 erd1...abc` + bouton ✏️

### Leaderboard
- **Avec username** : `@john-doe` (bold)
- **Sans username** : `Anonymous User` (italique)

### Autres Composants
Partout où un utilisateur est affiché :
- Toujours vérifier `username` en premier
- Fallback sur `wallet_address` ou "Anonymous"
- Format recommandé : `@username`

---

## 🧪 Tests Manuels

### Scénario 1 : Première Modification
1. Se connecter avec un wallet
2. Ouvrir la sidebar → Cliquer sur ✏️
3. Entrer un username valide (ex: `test-user-123`)
4. Sauvegarder
5. ✅ Le pseudo doit s'afficher dans la sidebar et le leaderboard

### Scénario 2 : Cooldown Actif
1. Essayer de modifier immédiatement après
2. ❌ Message : "Tu pourras changer ton pseudo dans 7 jours"
3. Le bouton "Save" doit être désactivé

### Scénario 3 : Validation
1. Essayer `ab` → ❌ "Trop court"
2. Essayer `test user` → ❌ "Caractères invalides"
3. Essayer un pseudo déjà pris → ❌ "Déjà pris"
4. Essayer `-test` → ❌ "Caractères invalides"

### Scénario 4 : Disponibilité (Debounced)
1. Commencer à taper un username
2. Attendre 500ms
3. ✅ Message "Username available" si disponible
4. ❌ Message "Already taken" si pris

### Scénario 5 : Sécurité (SQL)
Tenter de modifier directement en SQL (en tant qu'utilisateur authentifié) :
```sql
-- Doit échouer
UPDATE users SET username = 'hacker' WHERE id = '<autre_user_id>';
```

---

## 🐛 Dépannage

### Problème : "Failed to update username"

**Causes possibles :**
1. Cooldown actif (< 7 jours depuis dernière modification)
2. Username déjà pris
3. Problème de connexion Supabase
4. Politique RLS manquante

**Solutions :**
```sql
-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Vérifier le cooldown
SELECT username_last_modified, 
       NOW() - username_last_modified AS time_since_last_change
FROM users WHERE id = '<user_id>';

-- Réinitialiser manuellement (ADMIN ONLY)
UPDATE users SET username_last_modified = NOW() - INTERVAL '8 days'
WHERE id = '<user_id>';
```

### Problème : Politique RLS Bloque les Updates

**Diagnostic :**
```sql
-- Vérifier que les deux politiques existent
SELECT policyname FROM pg_policies 
WHERE tablename = 'users' 
AND policyname IN (
  'Users can update own profile (non-username)',
  'Users can update own username with cooldown'
);
```

**Solution :**
Réexécuter la migration SQL complète.

### Problème : Username Null après Mise à Jour

**Cause :** Le trigger ne s'est pas exécuté.

**Solution :**
```sql
-- Vérifier le trigger
SELECT tgname FROM pg_trigger WHERE tgname = 'set_username_last_modified';

-- Recréer si nécessaire
DROP TRIGGER IF EXISTS set_username_last_modified ON users;
CREATE TRIGGER set_username_last_modified...
```

---

## 📈 Performance

### Optimisations Implémentées

1. **Index sur Username**
   ```sql
   CREATE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
   ```
   - Accélère les recherches de disponibilité
   - Partial index (seulement les rows avec username)

2. **Debounce sur Vérification de Disponibilité**
   - 500ms de délai avant la vérification
   - Évite les appels API en rafale

3. **Validation Locale d'Abord**
   - Regex vérifié côté client avant appel API
   - Économise des appels inutiles

4. **Contrainte UNIQUE au Niveau DB**
   - Évite les race conditions
   - Garantie absolue d'unicité

---

## 🔄 Mises à Jour Futures

### Fonctionnalités Possibles

1. **Historique des Usernames**
   ```sql
   CREATE TABLE username_history (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     old_username TEXT,
     new_username TEXT,
     changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Username Reservés**
   ```typescript
   const RESERVED_USERNAMES = ['admin', 'system', 'galacticx', 'moderator'];
   ```

3. **Badges pour Premiers Utilisateurs**
   - Badge "OG" pour les 100 premiers usernames

4. **Recherche d'Utilisateurs par Username**
   ```typescript
   const searchUsers = (query: string) => {
     return supabase
       .from('users')
       .select('*')
       .ilike('username', `%${query}%`)
       .limit(10);
   };
   ```

---

## ✅ Checklist de Déploiement

- [ ] Migration SQL exécutée sur Supabase
- [ ] Vérification des politiques RLS
- [ ] Tests manuels des 5 scénarios
- [ ] Vérification de l'affichage dans sidebar
- [ ] Vérification de l'affichage dans leaderboard
- [ ] Test de sécurité (tentative de modification d'un autre user)
- [ ] Test du cooldown (modifier 2 fois de suite)
- [ ] Vérification des traductions FR/EN
- [ ] Test mobile (modal responsive)
- [ ] Test des 3 thèmes (dark, light, vibe)

---

## 📚 Ressources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/plpgsql-trigger.html)
- [React i18next](https://react.i18next.com/)

---

## 👨‍💻 Maintenance

### Logs à Surveiller

```typescript
// Client-side
console.log('[UsernameService] Username updated:', username);
console.error('[UsernameService] Update error:', error);

// Server-side (Supabase)
SELECT * FROM postgres_logs WHERE message LIKE '%username%';
```

### Métriques à Tracker

1. Nombre de modifications de username / jour
2. Taux de réussite des updates
3. Erreurs les plus fréquentes (validation, cooldown, duplicate)
4. Temps moyen de vérification de disponibilité

---

**✅ Système de Username Complètement Implémenté et Sécurisé !**

