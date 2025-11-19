import { db } from '../database-drizzle.js';
import { games, gameControllers, gamePlatforms, gameGenres, gameTags, controllers, platforms, genres, tags } from '../Models/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Script pour vérifier l'état des relations dans les tables de jointure
 */
async function checkRelations() {
    console.log('🔍 Vérification des relations...\n');

    try {
        // Vérifier les jeux
        const allGames = await db.select().from(games);
        console.log(`📦 Nombre total de jeux: ${allGames.length}`);

        // Vérifier les relations
        const [controllersCount, platformsCount, genresCount, tagsCount] = await Promise.all([
            db.select().from(gameControllers),
            db.select().from(gamePlatforms),
            db.select().from(gameGenres),
            db.select().from(gameTags),
        ]);

        console.log(`\n📊 État des tables de jointure:`);
        console.log(`  - GameControllers: ${controllersCount.length} relations`);
        console.log(`  - GamePlatforms: ${platformsCount.length} relations`);
        console.log(`  - GameGenres: ${genresCount.length} relations`);
        console.log(`  - GameTags: ${tagsCount.length} relations`);

        // Vérifier les jeux sans relations
        const gamesWithoutRelations = allGames.filter(async (game) => {
            const [hasControllers, hasPlatforms, hasGenres, hasTags] = await Promise.all([
                db.select().from(gameControllers).where(eq(gameControllers.GameId, game.id)).limit(1),
                db.select().from(gamePlatforms).where(eq(gamePlatforms.GameId, game.id)).limit(1),
                db.select().from(gameGenres).where(eq(gameGenres.GameId, game.id)).limit(1),
                db.select().from(gameTags).where(eq(gameTags.GameId, game.id)).limit(1),
            ]);

            return hasControllers.length === 0 && hasPlatforms.length === 0 && 
                   hasGenres.length === 0 && hasTags.length === 0;
        });

        console.log(`\n⚠️  Jeux sans relations: ${gamesWithoutRelations.length}`);

        // Afficher quelques exemples
        if (allGames.length > 0) {
            console.log(`\n📋 Exemples de jeux:`);
            for (const game of allGames.slice(0, 3)) {
                const [gameControllersList, gamePlatformsList, gameGenresList, gameTagsList] = await Promise.all([
                    db.select().from(gameControllers).where(eq(gameControllers.GameId, game.id)),
                    db.select().from(gamePlatforms).where(eq(gamePlatforms.GameId, game.id)),
                    db.select().from(gameGenres).where(eq(gameGenres.GameId, game.id)),
                    db.select().from(gameTags).where(eq(gameTags.GameId, game.id)),
                ]);

                console.log(`\n  🎮 ${game.title} (ID: ${game.id})`);
                console.log(`     - Contrôleurs: ${gameControllersList.length}`);
                console.log(`     - Plateformes: ${gamePlatformsList.length}`);
                console.log(`     - Genres: ${gameGenresList.length}`);
                console.log(`     - Tags: ${gameTagsList.length}`);
            }
        }

        console.log('\n✅ Vérification terminée');
    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
    }
}

// Exécuter le script
checkRelations()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

