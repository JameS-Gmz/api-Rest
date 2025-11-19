# Guide de Test de la Migration Drizzle

## ✅ État actuel

La migration Drizzle a été générée avec succès ! Le fichier de migration se trouve dans `drizzle/0000_closed_phantom_reporter.sql`

## 🔍 Options pour tester

### Option 1 : Si votre BDD existe déjà (RECOMMANDÉ)

**Vous n'avez PAS besoin de supprimer votre BDD !**

1. **Vérifier les différences** :
   ```bash
   npx drizzle-kit push
   ```
   Cette commande va comparer votre schéma Drizzle avec votre BDD existante et appliquer uniquement les différences.

2. **OU appliquer les migrations** :
   ```bash
   npx drizzle-kit migrate
   ```
   Cette commande applique les migrations générées.

### Option 2 : Si vous voulez repartir de zéro (TEST)

Si vous voulez tester avec une BDD vierge :

1. **Supprimer la BDD** (optionnel, seulement pour tester) :
   ```sql
   DROP DATABASE IF EXISTS PlayForge;
   CREATE DATABASE PlayForge;
   ```

2. **Appliquer les migrations** :
   ```bash
   npx drizzle-kit migrate
   ```

## 🧪 Tester les routes

Une fois les migrations appliquées, testez les routes :

### 1. Démarrer le serveur
```bash
npm run dev
```

### 2. Tester les endpoints

**Créer un utilisateur** :
```bash
POST http://localhost:9090/user/signup
Body: {
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Se connecter** :
```bash
POST http://localhost:9090/user/signin
Body: {
  "email": "test@example.com",
  "password": "password123"
}
```

**Récupérer tous les jeux** :
```bash
GET http://localhost:9090/game/AllGames
```

**Récupérer les rôles** :
```bash
GET http://localhost:9090/role/all
```

## ⚠️ Points importants

1. **Les données existantes seront préservées** si vous utilisez `drizzle-kit push` ou `migrate`
2. **Les noms de tables** doivent correspondre (Drizzle utilise les noms du schéma)
3. **Les relations** sont gérées automatiquement par Drizzle

## 🔧 Commandes utiles

- `npx drizzle-kit generate` - Générer les migrations
- `npx drizzle-kit migrate` - Appliquer les migrations
- `npx drizzle-kit push` - Synchroniser le schéma (sans migrations)
- `npx drizzle-kit introspect` - Inspecter la BDD existante
- `npx drizzle-kit studio` - Ouvrir Drizzle Studio (interface graphique)

## 📝 Vérification

Pour vérifier que tout fonctionne :

1. ✅ Les migrations sont générées
2. ✅ Le serveur démarre sans erreur
3. ✅ Les routes répondent correctement
4. ✅ Les données sont créées/récupérées correctement

