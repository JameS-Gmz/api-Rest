import { Router } from 'express';
import { db } from '../database-drizzle.js';
import { roles, statuses, languages, controllers, platforms, genres, tags, games, gameControllers, gamePlatforms, gameGenres, gameTags } from '../Models/schema.js';
import { eq } from 'drizzle-orm';
export const categoryRoutes = Router();
// ============================================
// ROLES
// ============================================
// GET /role/all - Récupérer tous les rôles
categoryRoutes.get('/role/all', async (req, res) => {
    try {
        const allRoles = await db.select().from(roles);
        res.status(200).json(allRoles);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des rôles :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des rôles' });
    }
});
// ============================================
// STATUSES
// ============================================
// GET /status/all - Récupérer tous les statuts
categoryRoutes.get('/status/all', async (req, res) => {
    try {
        const allStatuses = await db.select().from(statuses);
        res.json(allStatuses);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des statuts :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statuts' });
    }
});
// GET /status/games/:StatusId - Récupérer les jeux d'un statut
categoryRoutes.get('/status/games/:StatusId', async (req, res) => {
    const statusId = parseInt(req.params.StatusId);
    try {
        const status = await db.select().from(statuses).where(eq(statuses.id, statusId)).limit(1);
        if (status.length === 0) {
            return res.status(404).json({ error: 'Statut non trouvé' });
        }
        const statusGames = await db.select().from(games).where(eq(games.StatusId, statusId));
        if (statusGames.length === 0) {
            return res.status(404).json({ message: 'Aucun jeu trouvé pour ce statut' });
        }
        res.status(200).json(statusGames);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux selon le status :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});
// ============================================
// LANGUAGES
// ============================================
// GET /language/all - Récupérer toutes les langues
categoryRoutes.get('/language/all', async (req, res) => {
    try {
        const allLanguages = await db.select().from(languages);
        res.json(allLanguages);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des langues :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des langues' });
    }
});
// GET /language/games/:languageId - Récupérer les jeux d'une langue
categoryRoutes.get('/language/games/:languageId', async (req, res) => {
    const languageId = parseInt(req.params.languageId);
    try {
        const language = await db.select().from(languages).where(eq(languages.id, languageId)).limit(1);
        if (language.length === 0) {
            return res.status(404).json({ error: 'Langue non trouvée' });
        }
        const languageGames = await db.select().from(games).where(eq(games.LanguageId, languageId));
        if (languageGames.length === 0) {
            return res.status(404).json({ message: 'Aucun jeu trouvé pour cette langue' });
        }
        res.status(200).json(languageGames);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux selon la langue :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});
// ============================================
// CONTROLLERS
// ============================================
// GET /controller/all - Récupérer tous les contrôleurs
categoryRoutes.get('/controller/all', async (req, res) => {
    try {
        const allControllers = await db.select().from(controllers);
        res.json(allControllers);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des contrôleurs :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des contrôleurs' });
    }
});
// GET /controller/games/:controllerId - Récupérer les jeux d'un contrôleur
categoryRoutes.get('/controller/games/:controllerId', async (req, res) => {
    const controllerId = parseInt(req.params.controllerId);
    try {
        const controller = await db.select().from(controllers).where(eq(controllers.id, controllerId)).limit(1);
        if (controller.length === 0) {
            return res.status(404).json({ error: 'Contrôleur non trouvé' });
        }
        const controllerGames = await db.select({ game: games })
            .from(gameControllers)
            .innerJoin(games, eq(gameControllers.GameId, games.id))
            .where(eq(gameControllers.ControllerId, controllerId));
        if (controllerGames.length === 0) {
            return res.status(404).json({ error: 'Aucun jeu trouvé pour ce contrôleur' });
        }
        res.status(200).json(controllerGames.map(cg => cg.game));
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});
// ============================================
// PLATFORMS
// ============================================
// GET /platform/all - Récupérer toutes les plateformes
categoryRoutes.get('/platform/all', async (req, res) => {
    try {
        const allPlatforms = await db.select().from(platforms);
        res.json(allPlatforms);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des plateformes :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des plateformes' });
    }
});
// GET /platform/games/:id - Récupérer les jeux d'une plateforme
categoryRoutes.get('/platform/games/:id', async (req, res) => {
    const platformId = parseInt(req.params.id);
    try {
        const platform = await db.select().from(platforms).where(eq(platforms.id, platformId)).limit(1);
        if (platform.length === 0) {
            return res.status(404).json({ error: 'Plateforme non trouvée' });
        }
        const platformGames = await db.select({ game: games })
            .from(gamePlatforms)
            .innerJoin(games, eq(gamePlatforms.GameId, games.id))
            .where(eq(gamePlatforms.PlatformId, platformId));
        res.json(platformGames.map(pg => pg.game));
    }
    catch (error) {
        console.error('Erreur lors de la récupération de la plateforme :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la plateforme' });
    }
});
// ============================================
// GENRES
// ============================================
// GET /genre/all - Récupérer tous les genres
categoryRoutes.get('/genre/all', async (req, res) => {
    try {
        const allGenres = await db.select().from(genres);
        res.status(201).json(allGenres);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des genres:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
// GET /genre/games/:id - Récupérer les jeux d'un genre
categoryRoutes.get('/genre/games/:id', async (req, res) => {
    const genreId = parseInt(req.params.id);
    try {
        const genre = await db.select().from(genres).where(eq(genres.id, genreId)).limit(1);
        if (genre.length === 0) {
            return res.status(404).json({ error: 'Genre non trouvé' });
        }
        const genreGames = await db.select({ game: games })
            .from(gameGenres)
            .innerJoin(games, eq(gameGenres.GameId, games.id))
            .where(eq(gameGenres.GenreId, genreId));
        if (genreGames.length === 0) {
            return res.status(404).json({ error: 'Aucun jeu trouvé pour ce genre' });
        }
        res.status(200).json(genreGames.map(gg => gg.game));
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});
// ============================================
// TAGS
// ============================================
// GET /tag/all - Récupérer tous les tags
categoryRoutes.get('/tag/all', async (req, res) => {
    try {
        const allTags = await db.select().from(tags);
        res.status(201).json(allTags);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des tags:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
// GET /tag/games/:id - Récupérer les jeux d'un tag
categoryRoutes.get('/tag/games/:id', async (req, res) => {
    const tagId = parseInt(req.params.id);
    try {
        const tag = await db.select().from(tags).where(eq(tags.id, tagId)).limit(1);
        if (tag.length === 0) {
            return res.status(404).json({ error: 'Tag non trouvé' });
        }
        const tagGames = await db.select({ game: games })
            .from(gameTags)
            .innerJoin(games, eq(gameTags.GameId, games.id))
            .where(eq(gameTags.TagId, tagId));
        if (tagGames.length === 0) {
            return res.status(404).json({ error: 'Aucun jeu trouvé pour ce tag' });
        }
        res.status(200).json(tagGames.map(tg => tg.game));
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});
