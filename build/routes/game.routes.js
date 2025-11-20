import { Router } from 'express';
import { db } from '../database-drizzle.js';
import { games, statuses, languages, users, controllers, platforms, genres, tags, gameControllers, gamePlatforms, gameGenres, gameTags, library } from '../Models/schema.js';
import { eq, like, between, desc } from 'drizzle-orm';
import { authorizeRole } from '../middleware/authRole.js';
export const gameRoutes = Router();
// POST /new - Créer un nouveau jeu
gameRoutes.post('/new', authorizeRole(['developer', 'admin']), async (req, res) => {
    try {
        const { title, description, price, authorStudio, madewith, StatusId, LanguageId, UserId, controllerIds, platformIds, genreIds, tagIds } = req.body;
        console.log('📥 [POST /game/new] Données reçues:', {
            title,
            madewith,
            authorStudio,
            controllerIds,
            platformIds,
            genreIds,
            tagIds
        });
        // Créer le jeu
        await db.insert(games).values({
            title,
            description,
            price: price || 0,
            authorStudio,
            madewith,
            StatusId,
            LanguageId,
            UserId,
        });
        console.log('✅ [POST /game/new] Jeu créé avec madewith:', madewith);
        // Récupérer le jeu créé (par titre car il est unique dans ce contexte)
        const [createdGame] = await db.select()
            .from(games)
            .where(eq(games.title, title))
            .orderBy(desc(games.createdAt))
            .limit(1);
        if (!createdGame) {
            return res.status(500).json({ error: 'Erreur lors de la création du jeu' });
        }
        const gameId = createdGame.id;
        // Ajouter les relations many-to-many
        if (controllerIds?.length) {
            await db.insert(gameControllers).values(controllerIds.map((id) => ({ GameId: gameId, ControllerId: id })));
        }
        if (platformIds?.length) {
            await db.insert(gamePlatforms).values(platformIds.map((id) => ({ GameId: gameId, PlatformId: id })));
        }
        if (genreIds?.length) {
            await db.insert(gameGenres).values(genreIds.map((id) => ({ GameId: gameId, GenreId: id })));
        }
        if (tagIds?.length) {
            await db.insert(gameTags).values(tagIds.map((id) => ({ GameId: gameId, TagId: id })));
        }
        // Ajouter automatiquement le jeu à la bibliothèque du développeur
        if (UserId) {
            await db.insert(library).values({
                GameId: gameId,
                UserId: UserId,
                addedAt: new Date(),
            });
        }
        // Récupérer le jeu avec toutes ses relations
        const gameWithRelations = await getGameWithRelations(gameId);
        res.status(201).json(gameWithRelations);
    }
    catch (error) {
        console.error('Erreur lors de la création du jeu :', error);
        res.status(500).json({ error: 'Erreur lors de la création du jeu' });
    }
});
// GET /AllGames - Récupérer tous les jeux
gameRoutes.get('/AllGames', async (req, res) => {
    try {
        const allGames = await db.select().from(games).orderBy(desc(games.createdAt));
        const gamesWithRelations = await Promise.all(allGames.map(game => getGameWithRelations(game.id)));
        res.status(200).json(gamesWithRelations);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});
// GET /id/:gameId - Récupérer un jeu par ID
gameRoutes.get('/id/:gameId', async (req, res) => {
    try {
        const gameId = parseInt(req.params.gameId);
        const gameWithRelations = await getGameWithRelations(gameId);
        if (!gameWithRelations) {
            return res.status(404).json({ error: 'Jeu non trouvé' });
        }
        res.status(200).json(gameWithRelations);
    }
    catch (error) {
        console.error('Erreur lors de la récupération du jeu:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du jeu' });
    }
});
// GET /search?q=query - Rechercher des jeux
gameRoutes.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Requête invalide, le paramètre de recherche est manquant.' });
    }
    try {
        const foundGames = await db.select()
            .from(games)
            .where(like(games.title, `%${query}%`));
        if (foundGames.length === 0) {
            return res.status(404).json({ error: 'Aucun jeu trouvé.' });
        }
        const gamesWithRelations = await Promise.all(foundGames.map(game => getGameWithRelations(game.id)));
        res.status(200).json(gamesWithRelations);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux.' });
    }
});
// GET /price/:min/:max - Rechercher des jeux par prix
gameRoutes.get('/price/:min/:max', async (req, res) => {
    try {
        const min = parseFloat(req.params.min);
        const max = parseFloat(req.params.max);
        if (isNaN(min) || isNaN(max)) {
            return res.status(400).json({ error: 'Les prix minimum et maximum doivent être des nombres' });
        }
        const foundGames = await db.select()
            .from(games)
            .where(between(games.price, min, max));
        const gamesWithRelations = await Promise.all(foundGames.map(game => getGameWithRelations(game.id)));
        res.status(200).json(gamesWithRelations);
    }
    catch (error) {
        console.error('Erreur lors de la recherche des jeux par prix:', error);
        res.status(500).json({ error: 'Erreur lors de la recherche des jeux par prix' });
    }
});
// GET /sequence/date - Récupérer les jeux triés par date
gameRoutes.get('/sequence/date', async (req, res) => {
    try {
        const gamesDate = await db.select()
            .from(games)
            .orderBy(desc(games.createdAt));
        res.status(200).json(gamesDate);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des jeux' });
    }
});
// DELETE /delete/:id - Supprimer un jeu
gameRoutes.delete('/delete/:id', authorizeRole(['admin', 'developer', 'superadmin']), async (req, res) => {
    const gameId = parseInt(req.params.id);
    try {
        // Supprimer d'abord les associations dans les tables de jointure
        await db.delete(gameControllers).where(eq(gameControllers.GameId, gameId));
        await db.delete(gamePlatforms).where(eq(gamePlatforms.GameId, gameId));
        await db.delete(gameGenres).where(eq(gameGenres.GameId, gameId));
        await db.delete(gameTags).where(eq(gameTags.GameId, gameId));
        await db.delete(library).where(eq(library.GameId, gameId));
        // Supprimer le jeu
        const result = await db.delete(games).where(eq(games.id, gameId));
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Jeu non trouvé' });
        }
        res.status(200).json({ message: 'Jeu supprimé avec succès' });
    }
    catch (error) {
        console.error('Erreur lors de la suppression du jeu :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression du jeu' });
    }
});
// PUT /update/:id - Mettre à jour un jeu
gameRoutes.put('/update/:id', authorizeRole(['admin', 'developer', 'superadmin']), async (req, res) => {
    const gameId = parseInt(req.params.id);
    const { title, description, price, authorStudio, madewith, StatusId, LanguageId } = req.body;
    try {
        await db.update(games)
            .set({
            title,
            description,
            price,
            authorStudio,
            madewith,
            StatusId,
            LanguageId,
            updatedAt: new Date(),
        })
            .where(eq(games.id, gameId));
        const gameWithRelations = await getGameWithRelations(gameId);
        if (!gameWithRelations) {
            return res.status(404).json({ message: 'Jeu non trouvé' });
        }
        res.status(200).json({ message: 'Jeu mis à jour avec succès', game: gameWithRelations });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour du jeu :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du jeu' });
    }
});
// POST /associate-categories - Associer des catégories à un jeu
gameRoutes.post('/associate-categories', async (req, res) => {
    const { GameId, ControllerId, PlatformId, StatusId, LanguageId, TagId, GenreId } = req.body;
    try {
        const gameId = parseInt(GameId);
        // Vérifier que le jeu existe
        const game = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
        if (game.length === 0) {
            return res.status(404).json({ error: 'Jeu non trouvé' });
        }
        // Mettre à jour StatusId et LanguageId si fournis
        if (StatusId) {
            await db.update(games).set({ StatusId: parseInt(StatusId) }).where(eq(games.id, gameId));
        }
        if (LanguageId) {
            await db.update(games).set({ LanguageId: parseInt(LanguageId) }).where(eq(games.id, gameId));
        }
        // Convertir en tableaux d'IDs
        const controllerIds = Array.isArray(ControllerId) ? ControllerId.map((id) => parseInt(id)) : [parseInt(ControllerId)];
        const platformIds = Array.isArray(PlatformId) ? PlatformId.map((id) => parseInt(id)) : [parseInt(PlatformId)];
        const tagIds = Array.isArray(TagId) ? TagId.map((id) => parseInt(id)) : TagId ? [parseInt(TagId)] : [];
        const genreIds = Array.isArray(GenreId) ? GenreId.map((id) => parseInt(id)) : GenreId ? [parseInt(GenreId)] : [];
        // Supprimer les anciennes associations et créer les nouvelles
        if (controllerIds.length > 0) {
            await db.delete(gameControllers).where(eq(gameControllers.GameId, gameId));
            await db.insert(gameControllers).values(controllerIds.map(id => ({ GameId: gameId, ControllerId: id })));
        }
        if (platformIds.length > 0) {
            await db.delete(gamePlatforms).where(eq(gamePlatforms.GameId, gameId));
            await db.insert(gamePlatforms).values(platformIds.map(id => ({ GameId: gameId, PlatformId: id })));
        }
        if (genreIds.length > 0) {
            await db.delete(gameGenres).where(eq(gameGenres.GameId, gameId));
            await db.insert(gameGenres).values(genreIds.map(id => ({ GameId: gameId, GenreId: id })));
        }
        if (tagIds.length > 0) {
            await db.delete(gameTags).where(eq(gameTags.GameId, gameId));
            await db.insert(gameTags).values(tagIds.map(id => ({ GameId: gameId, TagId: id })));
        }
        // Récupérer le jeu mis à jour avec toutes ses relations
        const updatedGame = await getGameWithRelations(gameId);
        res.status(200).json({
            message: 'Jeu mis à jour avec succès avec les catégories associées.',
            game: updatedGame
        });
    }
    catch (error) {
        console.error('Erreur détaillée lors de l\'association des catégories:', error);
        res.status(500).json({
            error: 'Erreur lors de l\'association des catégories',
            details: error.message
        });
    }
});
// GET /by-user/:userId - Récupérer les jeux d'un utilisateur
gameRoutes.get('/by-user/:userId', authorizeRole(['developer']), async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const userGames = await db.select()
            .from(games)
            .where(eq(games.UserId, userId));
        const gamesWithRelations = await Promise.all(userGames.map(game => getGameWithRelations(game.id)));
        if (gamesWithRelations.length === 0) {
            return res.status(404).json({ message: 'Aucun jeu trouvé pour cet utilisateur' });
        }
        res.status(200).json(gamesWithRelations);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});
// GET /last-updated - Récupérer les jeux triés par date de mise à jour
gameRoutes.get('/last-updated', async (req, res) => {
    try {
        const gamesUpdated = await db.select()
            .from(games)
            .orderBy(desc(games.updatedAt));
        const gamesWithRelations = await Promise.all(gamesUpdated.map(game => getGameWithRelations(game.id)));
        res.status(200).json(gamesWithRelations);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux par date de mise à jour:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});
// GET /check-relations - Vérifier l'état des relations (pour debug)
gameRoutes.get('/check-relations', async (req, res) => {
    try {
        const allGames = await db.select().from(games);
        const [controllersCount, platformsCount, genresCount, tagsCount] = await Promise.all([
            db.select().from(gameControllers),
            db.select().from(gamePlatforms),
            db.select().from(gameGenres),
            db.select().from(gameTags),
        ]);
        const gamesStatus = await Promise.all(allGames.map(async (game) => {
            const [hasControllers, hasPlatforms, hasGenres, hasTags] = await Promise.all([
                db.select().from(gameControllers).where(eq(gameControllers.GameId, game.id)).limit(1),
                db.select().from(gamePlatforms).where(eq(gamePlatforms.GameId, game.id)).limit(1),
                db.select().from(gameGenres).where(eq(gameGenres.GameId, game.id)).limit(1),
                db.select().from(gameTags).where(eq(gameTags.GameId, game.id)).limit(1),
            ]);
            return {
                id: game.id,
                title: game.title,
                hasControllers: hasControllers.length > 0,
                hasPlatforms: hasPlatforms.length > 0,
                hasGenres: hasGenres.length > 0,
                hasTags: hasTags.length > 0,
                hasAnyRelation: hasControllers.length > 0 || hasPlatforms.length > 0 ||
                    hasGenres.length > 0 || hasTags.length > 0,
            };
        }));
        res.status(200).json({
            summary: {
                totalGames: allGames.length,
                gamesWithRelations: gamesStatus.filter(g => g.hasAnyRelation).length,
                gamesWithoutRelations: gamesStatus.filter(g => !g.hasAnyRelation).length,
                totalRelations: {
                    controllers: controllersCount.length,
                    platforms: platformsCount.length,
                    genres: genresCount.length,
                    tags: tagsCount.length,
                }
            },
            games: gamesStatus,
        });
    }
    catch (error) {
        console.error('Erreur lors de la vérification des relations:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification des relations' });
    }
});
// Fonction helper pour récupérer un jeu avec toutes ses relations
async function getGameWithRelations(gameId) {
    const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
    if (!game)
        return null;
    console.log('🔍 [getGameWithRelations] Jeu récupéré:', {
        id: game.id,
        title: game.title,
        madewith: game.madewith,
        allKeys: Object.keys(game)
    });
    const [gameStatus, gameLanguage, gameOwner] = await Promise.all([
        game.StatusId ? db.select().from(statuses).where(eq(statuses.id, game.StatusId)).limit(1) : Promise.resolve([]),
        game.LanguageId ? db.select().from(languages).where(eq(languages.id, game.LanguageId)).limit(1) : Promise.resolve([]),
        game.UserId ? db.select().from(users).where(eq(users.id, game.UserId)).limit(1) : Promise.resolve([]),
    ]);
    const [gameControllersList, gamePlatformsList, gameGenresList, gameTagsList] = await Promise.all([
        db.select({ controller: controllers })
            .from(gameControllers)
            .innerJoin(controllers, eq(gameControllers.ControllerId, controllers.id))
            .where(eq(gameControllers.GameId, gameId)),
        db.select({ platform: platforms })
            .from(gamePlatforms)
            .innerJoin(platforms, eq(gamePlatforms.PlatformId, platforms.id))
            .where(eq(gamePlatforms.GameId, gameId)),
        db.select({ genre: genres })
            .from(gameGenres)
            .innerJoin(genres, eq(gameGenres.GenreId, genres.id))
            .where(eq(gameGenres.GameId, gameId)),
        db.select({ tag: tags })
            .from(gameTags)
            .innerJoin(tags, eq(gameTags.TagId, tags.id))
            .where(eq(gameTags.GameId, gameId)),
    ]);
    return {
        ...game,
        status: gameStatus[0] || null,
        language: gameLanguage[0] || null,
        gameOwner: gameOwner[0] || null,
        controllers: gameControllersList.map(gc => gc.controller),
        platforms: gamePlatformsList.map(gp => gp.platform),
        genres: gameGenresList.map(gg => gg.genre),
        tags: gameTagsList.map(gt => gt.tag),
    };
}
