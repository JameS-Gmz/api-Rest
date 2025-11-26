import { db } from '../database-drizzle.js';
import { 
    games, gameControllers, gamePlatforms, gameGenres, gameTags,
    controllers, platforms, genres, tags
} from '../Models/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Script pour initialiser les relations des jeux existants
 * Ce script peut être utilisé pour ajouter des relations par défaut aux jeux qui n'en ont pas
 */

interface GameRelationConfig {
    gameId: number;
    controllerIds?: number[];
    platformIds?: number[];
    genreIds?: number[];
    tagIds?: number[];
}

/**
 * Ajouter des relations à un jeu
 */
async function addGameRelations(config: GameRelationConfig) {
    const { gameId, controllerIds = [], platformIds = [], genreIds = [], tagIds = [] } = config;

    try {
        // Vérifier que le jeu existe
        const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
        if (!game) {
            console.log(`⚠️  Jeu ID ${gameId} non trouvé`);
            return;
        }

        // Ajouter les contrôleurs
        if (controllerIds.length > 0) {
            // Supprimer les anciennes relations
            await db.delete(gameControllers).where(eq(gameControllers.GameId, gameId));
            // Ajouter les nouvelles
            await db.insert(gameControllers).values(
                controllerIds.map(id => ({ GameId: gameId, ControllerId: id }))
            );
            console.log(`  ✅ ${controllerIds.length} contrôleur(s) ajouté(s)`);
        }

        // Ajouter les plateformes
        if (platformIds.length > 0) {
            await db.delete(gamePlatforms).where(eq(gamePlatforms.GameId, gameId));
            await db.insert(gamePlatforms).values(
                platformIds.map(id => ({ GameId: gameId, PlatformId: id }))
            );
            console.log(`  ✅ ${platformIds.length} plateforme(s) ajoutée(s)`);
        }

        // Ajouter les genres
        if (genreIds.length > 0) {
            await db.delete(gameGenres).where(eq(gameGenres.GameId, gameId));
            await db.insert(gameGenres).values(
                genreIds.map(id => ({ GameId: gameId, GenreId: id }))
            );
            console.log(`  ✅ ${genreIds.length} genre(s) ajouté(s)`);
        }

        // Ajouter les tags
        if (tagIds.length > 0) {
            await db.delete(gameTags).where(eq(gameTags.GameId, gameId));
            await db.insert(gameTags).values(
                tagIds.map(id => ({ GameId: gameId, TagId: id }))
            );
            console.log(`  ✅ ${tagIds.length} tag(s) ajouté(s)`);
        }
    } catch (error) {
        console.error(`❌ Erreur lors de l'ajout des relations pour le jeu ${gameId}:`, error);
    }
}

/**
 * Initialiser les relations pour tous les jeux sans relations
 */
async function initAllGameRelations() {
    console.log('🚀 Initialisation des relations pour les jeux...\n');

    try {
        // Récupérer tous les jeux
        const allGames = await db.select().from(games);
        console.log(`📦 ${allGames.length} jeu(x) trouvé(s)\n`);

        // Récupérer les catégories disponibles
        const [allControllers, allPlatforms, allGenres, allTags] = await Promise.all([
            db.select().from(controllers),
            db.select().from(platforms),
            db.select().from(genres),
            db.select().from(tags),
        ]);

        console.log(`📋 Catégories disponibles:`);
        console.log(`  - Contrôleurs: ${allControllers.length}`);
        console.log(`  - Plateformes: ${allPlatforms.length}`);
        console.log(`  - Genres: ${allGenres.length}`);
        console.log(`  - Tags: ${allTags.length}\n`);

        // Pour chaque jeu, vérifier s'il a des relations
        for (const game of allGames) {
            const [hasControllers, hasPlatforms, hasGenres, hasTags] = await Promise.all([
                db.select().from(gameControllers).where(eq(gameControllers.GameId, game.id)).limit(1),
                db.select().from(gamePlatforms).where(eq(gamePlatforms.GameId, game.id)).limit(1),
                db.select().from(gameGenres).where(eq(gameGenres.GameId, game.id)).limit(1),
                db.select().from(gameTags).where(eq(gameTags.GameId, game.id)).limit(1),
            ]);

            const hasAnyRelation = hasControllers.length > 0 || hasPlatforms.length > 0 || 
                                  hasGenres.length > 0 || hasTags.length > 0;

            if (!hasAnyRelation) {
                console.log(`🎮 Jeu sans relations: ${game.title} (ID: ${game.id})`);
                console.log(`   ⚠️  Aucune relation trouvée - vous pouvez ajouter des relations manuellement`);
                console.log(`   💡 Utilisez la route POST /game/associate-categories pour ajouter des relations\n`);
            } else {
                console.log(`✅ ${game.title} (ID: ${game.id}) a déjà des relations\n`);
            }
        }

        console.log('✅ Vérification terminée');
        console.log('\n💡 Pour ajouter des relations, utilisez:');
        console.log('   POST /game/associate-categories');
        console.log('   Body: { GameId, ControllerId, PlatformId, GenreId, TagId }');

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
    }
}

// Exécuter le script
if (require.main === module) {
    initAllGameRelations()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export { addGameRelations, initAllGameRelations };

