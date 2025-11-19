# Guide d'utilisation - Upload d'images avec initialisation

## Architecture

Le système utilise deux APIs séparées :
- **API Boutique** (port 9090) : Gère les jeux et l'initialisation
- **API Upload** (port 9091) : Gère l'upload et le stockage des images

## Prérequis

1. **Démarrer l'API Upload** :
   ```bash
   cd api-upload
   npm run build
   npm start
   ```

2. **Démarrer l'API Boutique** :
   ```bash
   cd api-boutique
   npm run build
   npm start
   ```

## Utilisation

### 1. Test de l'upload d'images

Pour tester si l'upload fonctionne :
```bash
cd api-boutique
npm run test-upload
```

### 2. Initialisation complète avec images

Pour initialiser la base de données avec les jeux ET leurs images :
```bash
cd api-boutique
npm run init
```

## Fonctionnement

### Script d'initialisation

Le script `src/initialization/script.ts` :

1. **Crée les jeux** dans la base de données
2. **Pour chaque jeu créé**, upload automatiquement l'image correspondante via l'API upload
3. **Associe l'image au jeu** via le `gameId`

### Mapping des images

Les images sont mappées dans le tableau `gamesWithImages` :
- `BattleQuest.png` → "Battle Quest"
- `SurvivalIsland.png` → "Survival Island"
- `SpaceOdyssey.png` → "Space Odyssey"
- etc.

### Stockage des images

- **Localisation** : `api-upload/src/uploads/`
- **Accès public** : `http://localhost:9091/uploads/[filename]`
- **Association** : Via la table `Files` dans l'API upload

## Résolution de problèmes

### Les images ne s'affichent pas

1. **Vérifier que l'API upload est démarrée** sur le port 9091
2. **Vérifier que le dossier uploads existe** : `api-upload/src/uploads/`
3. **Vérifier les logs** lors de l'initialisation
4. **Tester l'upload manuellement** : `npm run test-upload`

### Erreur CORS

Si vous avez des erreurs CORS, vérifiez que l'API upload autorise bien l'origine `http://localhost:9090` dans `api-upload/src/app.ts`.

### Images non trouvées

Vérifiez que les images sont bien présentes dans le dossier `api-boutique/assets/` avec les noms exacts définis dans le script.

## Structure des fichiers

```
api-boutique/
├── assets/                    # Images des jeux
│   ├── BattleQuest.png
│   ├── SurvivalIsland.png
│   └── ...
├── src/
│   └── initialization/
│       └── script.ts         # Script d'initialisation
├── test-upload.js            # Script de test
└── run-init.js              # Script d'exécution

api-upload/
├── src/
│   ├── uploads/             # Images uploadées
│   ├── Models/
│   │   └── File.ts         # Gestion des fichiers
│   └── app.ts              # Configuration CORS
```

## API Endpoints

### API Upload (port 9091)

- `POST /upload/file` : Upload d'une image pour un jeu
- `GET /image/:gameId` : Récupérer l'image d'un jeu
- `GET /images/:gameId` : Récupérer toutes les images d'un jeu

### API Boutique (port 9090)

- `GET /game/AllGames` : Récupérer tous les jeux
- `GET /game/id/:gameId` : Récupérer un jeu spécifique 