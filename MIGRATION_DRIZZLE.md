# Migration Sequelize → Drizzle ORM

## ✅ Étape 1 : Conversion du schéma - TERMINÉE

Tous les modèles Sequelize ont été convertis en schémas Drizzle ORM dans un fichier unique : `src/Models/schema.ts`

### Modèles convertis :

1. **Users** → `users` table
2. **Roles** → `roles` table
3. **Games** → `games` table
4. **Statuses** → `statuses` table
5. **Languages** → `languages` table
6. **Controllers** → `controllers` table
7. **Platforms** → `platforms` table
8. **Genres** → `genres` table
9. **Tags** → `tags` table
10. **Carts** → `carts` table

### Tables de jointure (Many-to-Many) :

- `GameControllers` → `gameControllers`
- `GamePlatforms` → `gamePlatforms`
- `GameGenres` → `gameGenres`
- `GameTags` → `gameTags`
- `Library` → `library` (User-Game)
- `Comment` → `comments` (User-Game)
- `Upload` → `uploads` (User-Game)
- `Order` → `orders` (User-Game)
- `GameCart` → `gameCart` (Cart-Game)

### Relations définies :

Toutes les relations Sequelize ont été converties en relations Drizzle ORM :
- `belongsTo` → `one()`
- `hasMany` → `many()`
- `belongsToMany` → `many()` avec tables de jointure

## 📦 Dépendances installées

- ✅ `drizzle-orm`
- ✅ `drizzle-kit`
- ✅ `mysql2` (déjà présent)

## 📁 Fichiers créés

1. **`src/Models/schema.ts`** : Tous les schémas Drizzle ORM
2. **`drizzle.config.ts`** : Configuration Drizzle Kit
3. **`src/database-drizzle.ts`** : Connexion à la base de données avec Drizzle

## 🚀 Prochaines étapes

### Étape 2 : Générer les migrations

```bash
npx drizzle-kit generate
```

### Étape 3 : Appliquer les migrations

```bash
npx drizzle-kit migrate
```

### Étape 4 : Mettre à jour le code applicatif

Remplacer les imports et utilisations de Sequelize par Drizzle dans :
- `src/Models/User.ts`
- `src/Models/Game.ts`
- `src/Models/Role.ts`
- `src/Models/Status.ts`
- `src/Models/Language.ts`
- `src/Models/Controller.ts`
- `src/Models/Platform.ts`
- `src/Models/Genre.ts`
- `src/Models/Tag.ts`
- `src/Models/Cart.ts`
- `src/app.ts`
- Tous les fichiers utilisant les modèles Sequelize

### Exemple de conversion de requête

**Sequelize :**
```typescript
const users = await User.findAll({ include: [{ model: Role, as: 'role' }] });
```

**Drizzle :**
```typescript
import { db } from './database-drizzle.js';
import { users, roles } from './Models/schema.js';
import { eq } from 'drizzle-orm';

const usersWithRoles = await db
    .select()
    .from(users)
    .leftJoin(roles, eq(users.RoleId, roles.id));
```

## 📝 Notes importantes

- Les noms de tables en Drizzle sont au pluriel (ex: `Users` → `users`)
- Les clés étrangères sont définies dans les relations, pas dans la définition de table
- Les types TypeScript sont automatiquement inférés via `$inferSelect` et `$inferInsert`
- Les timestamps `createdAt` et `updatedAt` sont gérés via `timestamp().defaultNow()` et `.onUpdateNow()`

## 🔍 Vérification

Pour vérifier que tout fonctionne :

```bash
# Générer les migrations
npx drizzle-kit generate

# Vérifier le schéma
npx drizzle-kit introspect
```

