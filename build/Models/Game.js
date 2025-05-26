import { sequelize } from "../database.js";
import { DataTypes, DOUBLE, Op, STRING } from "sequelize";
import { Router } from 'express';
import { Controller } from "./Controller.js";
import { Platform } from "./Platform.js";
import { Status } from "./Status.js";
import { Language } from "./Language.js";
import { Genre } from "./Genre.js";
import { Tag } from "./Tag.js";
import { authorizeRole } from "../middleware/authRole.js";
import { User } from "./User.js";
export const GameRoute = Router();
export const Game = sequelize.define("Game", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    price: {
        type: DOUBLE,
        allowNull: false,
        defaultValue: 0,
        validate: {
            max: 100,
            min: 0,
        }
    },
    authorStudio: {
        type: STRING,
        allowNull: true,
    },
    madewith: {
        type: STRING,
        allowNull: true,
    },
    description: {
        type: STRING(1500),
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    StatusId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Statuses',
            key: 'id',
        }
    },
    LanguageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Languages',
            key: 'id',
        }
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id',
        }
    }
});
// Note: All relationships are now managed in associations.ts
GameRoute.post('/new', authorizeRole(['developer', 'admin']), async (req, res) => {
    try {
        const { title, description, price, authorStudio, madewith, StatusId, LanguageId, UserId, controllerIds, platformIds, genreIds, tagIds } = req.body;
        // Création du jeu
        const game = await Game.create({
            title, description, price, authorStudio,
            madewith, StatusId, LanguageId, UserId
        });
        // Ajout des relations many-to-many si fournies
        if (controllerIds?.length) {
            await game.addControllers(controllerIds);
        }
        if (platformIds?.length) {
            await game.addPlatforms(platformIds);
        }
        if (genreIds?.length) {
            await game.addGenres(genreIds);
        }
        if (tagIds?.length) {
            await game.addTags(tagIds);
        }
        // Ajouter automatiquement le jeu à la bibliothèque du développeur
        if (UserId) {
            await sequelize.models.Library.create({
                GameId: game.id,
                UserId: UserId
            });
            console.log(`Jeu ${game.id} ajouté à la bibliothèque de l'utilisateur ${UserId}`);
        }
        // Récupération du jeu avec toutes ses relations
        const gameWithRelations = await Game.findByPk(game.id, {
            include: [
                { model: Controller, as: 'controllers' },
                { model: Platform, as: 'platforms' },
                { model: Genre, as: 'genres' },
                { model: Tag, as: 'tags' },
                { model: Status, as: 'status' },
                { model: Language, as: 'language' },
                { model: User, as: 'gameOwner' }
            ]
        });
        res.status(201).json(gameWithRelations);
    }
    catch (error) {
        console.error('Erreur lors de la création du jeu :', error);
        res.status(500).json({ error: 'Erreur lors de la création du jeu' });
    }
});
GameRoute.post('/new/manyGames', authorizeRole(['admin', 'developer', 'user']), async (req, res) => {
    try {
        // Assurez-vous que req.body est un tableau d'objets de jeux
        const games = [
            {
                title: 'Battle Quest',
                price: 19.99,
                authorStudio: 'Epic Games Studio',
                madeWith: 'Unreal Engine 5',
                description: 'An epic action-adventure game with breathtaking visuals and a compelling storyline.',
                createdAt: new Date('2024-01-15T12:00:00Z'),
                updatedAt: new Date('2024-09-15T12:00:00Z'),
                StatusId: 1,
                LanguageId: 1
            },
            {
                title: 'Survival Island',
                price: 14.99,
                authorStudio: 'Survive Studios',
                madeWith: 'Unity',
                description: 'A survival game where you must gather resources and fight for your life on a deserted island.',
                createdAt: new Date('2023-07-10T10:00:00Z'),
                updatedAt: new Date('2023-08-12T12:00:00Z'),
                StatusId: 2,
                LanguageId: 3
            },
            {
                title: 'Space Odyssey',
                price: 29.99,
                authorStudio: 'Galaxy Interactive',
                madeWith: 'Godot Engine',
                description: 'A space exploration game set in a massive open world with realistic physics and environments.',
                createdAt: new Date('2024-02-01T14:00:00Z'),
                updatedAt: new Date('2024-03-01T12:00:00Z'),
                StatusId: 1,
                LanguageId: 2
            },
            {
                title: 'Fantasy Warriors',
                price: 39.99,
                authorStudio: 'Dragon Lore Studios',
                madeWith: 'RPG Maker',
                description: 'A role-playing game filled with fantasy creatures, magic, and heroic quests.',
                createdAt: new Date('2023-06-20T09:00:00Z'),
                updatedAt: new Date('2023-07-20T15:00:00Z'),
                StatusId: 3,
                LanguageId: 4
            },
            {
                title: 'Rhythm Beat',
                price: 9.99,
                authorStudio: 'Beat Masters',
                madeWith: 'Custom Engine',
                description: 'A fast-paced rhythm game that challenges your musical and reflex skills.',
                createdAt: new Date('2024-05-10T18:00:00Z'),
                updatedAt: new Date('2024-05-20T20:00:00Z'),
                StatusId: 1,
                LanguageId: 5
            },
            {
                title: 'Rogue Dungeon',
                price: 24.99,
                authorStudio: 'Dungeon Crawler Inc.',
                madeWith: 'Godot Engine',
                description: 'A roguelike dungeon crawler with procedurally generated levels and permadeath.',
                createdAt: new Date('2023-03-12T08:00:00Z'),
                updatedAt: new Date('2023-04-15T11:00:00Z'),
                StatusId: 2,
                LanguageId: 1
            },
            {
                title: 'Simulator Pro',
                price: 34.99,
                authorStudio: 'SimPro Studios',
                madeWith: 'Unity',
                description: 'The ultimate simulation game, where you can create and manage everything from cities to farms.',
                createdAt: new Date('2024-04-05T16:00:00Z'),
                updatedAt: new Date('2024-04-15T16:00:00Z'),
                StatusId: 3,
                LanguageId: 3
            }
        ];
        // Validation simple pour s'assurer que c'est un tableau
        if (!Array.isArray(games)) {
            return res.status(400).json({ error: 'Le corps de la requête doit être un tableau d\'objets de jeux' });
        }
        // Utiliser bulkCreate pour insérer plusieurs jeux
        const createdGames = await Game.bulkCreate(games);
        // Répondre avec un message de succès
        res.status(201).json({
            message: 'Jeux créés avec succès !',
            games: createdGames // Optionnel: Inclure les jeux créés dans la réponse
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion des jeux :', error);
        res.status(500).json({ error: 'Erreur lors de l\'insertion des jeux' });
    }
});
GameRoute.get("/AllGames", async (req, res) => {
    try {
        const games = await Game.findAll({
            include: [
                { model: Controller, as: 'controllers' },
                { model: Platform, as: 'platforms' },
                { model: Genre, as: 'genres' },
                { model: Tag, as: 'tags' },
                { model: Status, as: 'status' },
                { model: Language, as: 'language' },
                { model: User, as: 'gameOwner' }
            ]
        });
        res.status(200).json(games);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});
GameRoute.get("/id/:gameId", async (req, res) => {
    try {
        const gameId = req.params.gameId;
        const game = await Game.findByPk(gameId, {
            include: [
                { model: Controller, as: 'controllers' },
                { model: Platform, as: 'platforms' },
                { model: Genre, as: 'genres' },
                { model: Tag, as: 'tags' },
                { model: Status, as: 'status' },
                { model: Language, as: 'language' },
                { model: User, as: 'gameOwner' }
            ]
        });
        if (!game) {
            return res.status(404).json({ error: 'Jeu non trouvé' });
        }
        res.status(200).json(game);
    }
    catch (error) {
        console.error('Erreur lors de la récupération du jeu:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du jeu' });
    }
});
GameRoute.get("/price/:min/:max", async (req, res) => {
    try {
        const min = parseFloat(req.params.min);
        const max = parseFloat(req.params.max);
        if (isNaN(min) || isNaN(max)) {
            return res.status(400).json({ error: 'Les prix minimum et maximum doivent être des nombres' });
        }
        const games = await Game.findAll({
            where: {
                price: {
                    [Op.between]: [min, max]
                }
            },
            include: [
                { model: Controller, as: 'controllers' },
                { model: Platform, as: 'platforms' },
                { model: Genre, as: 'genres' },
                { model: Tag, as: 'tags' },
                { model: Status, as: 'status' },
                { model: Language, as: 'language' },
                { model: User, as: 'gameOwner' }
            ]
        });
        res.status(200).json(games);
    }
    catch (error) {
        console.error('Erreur lors de la recherche des jeux par prix:', error);
        res.status(500).json({ error: 'Erreur lors de la recherche des jeux par prix' });
    }
});
GameRoute.get("/sequence/date", async (req, res) => {
    try {
        const gamesDate = await Game.findAll({
            order: [['createdAt', 'DESC']], // Trier par 'createdAt' en ordre décroissant
        });
        res.status(200).json(gamesDate);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des jeux' });
    }
});
GameRoute.get('/search', async (req, res) => {
    const query = req.query.q; // Exemple: /search?q=nomdujeu
    if (!query) {
        return res.status(400).json({ error: 'Requête invalide, le paramètre de recherche est manquant.' });
    }
    try {
        console.log('Recherche effectuée avec le terme :', query);
        // Rechercher des jeux dans la base de données
        const games = await Game.findAll({
            where: {
                title: {
                    [Op.like]: `%${query}%` // Recherche partielle
                }
            }
        });
        console.log('Jeux trouvés:', games); // Log les jeux trouvés
        if (games.length === 0) {
            return res.status(404).json({ error: 'Aucun jeu trouvé.' });
        }
        res.status(200).json(games); // Retourne les jeux trouvés
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux.' });
    }
});
//route qui supprime un jeu selon son id
GameRoute.delete("/delete/:id", authorizeRole(['admin', 'developer', 'superadmin']), async (req, res) => {
    try {
        const id = req.params.id;
        const nbDeletedGames = await Game.destroy({
            where: {
                id: isNaN(Number(id)) ? 0 : id, //operateur ternaire => const r == conditions? valretour1 : valretour2
            }
        });
        if (nbDeletedGames == 0) {
            res.status(404).json("Aucun produit trouvé");
        }
        else {
            res.status(200).json("Tous les produits contenant le mot ou l'id suivant ont été supprimés : " + id);
        }
    }
    catch (error) {
        console.log(error);
    }
});
GameRoute.post('/associate-categories', async (req, res) => {
    const { GameId, ControllerId, PlatformId, StatusId, LanguageId, TagId, GenreId } = req.body;
    console.log('Données reçues:', {
        GameId,
        ControllerId,
        PlatformId,
        StatusId,
        LanguageId,
        TagId,
        GenreId
    });
    // Convertir en tableau d'IDs si nécessaire
    const controllerIds = Array.isArray(ControllerId) ? ControllerId.map(id => parseInt(id, 10)) : [parseInt(ControllerId, 10)];
    const platformIds = Array.isArray(PlatformId) ? PlatformId.map(id => parseInt(id, 10)) : [parseInt(PlatformId, 10)];
    const tagIds = Array.isArray(TagId) ? TagId.map(id => parseInt(id, 10)) : TagId ? [parseInt(TagId, 10)] : [];
    const genreIds = Array.isArray(GenreId) ? GenreId.map(id => parseInt(id, 10)) : GenreId ? [parseInt(GenreId, 10)] : [];
    console.log('IDs après conversion:', {
        controllerIds,
        platformIds,
        tagIds,
        genreIds
    });
    try {
        // Vérifier que le jeu existe
        const game = await Game.findByPk(GameId);
        if (!game) {
            return res.status(404).json({ error: 'Jeu non trouvé' });
        }
        // Vérifier que le statut existe
        if (StatusId) {
            const status = await Status.findByPk(StatusId);
            if (!status) {
                return res.status(404).json({ error: 'Statut non trouvé' });
            }
            await game.update({ StatusId });
        }
        // Vérifier que la langue existe
        if (LanguageId) {
            const language = await Language.findByPk(LanguageId);
            if (!language) {
                return res.status(404).json({ error: 'Langue non trouvée' });
            }
            await game.update({ LanguageId });
        }
        // Rechercher et associer les contrôleurs
        if (controllerIds.length > 0) {
            console.log('Association des contrôleurs:', controllerIds);
            const controllers = await Controller.findAll({ where: { id: controllerIds } });
            if (!controllers.length) {
                return res.status(400).json({ error: 'Aucun contrôleur trouvé pour les IDs spécifiés' });
            }
            await sequelize.models.GameControllers.destroy({ where: { GameId } });
            await sequelize.models.GameControllers.bulkCreate(controllerIds.map(id => ({ GameId, ControllerId: id })));
        }
        // Rechercher et associer les plateformes
        if (platformIds.length > 0) {
            console.log('Association des plateformes:', platformIds);
            const platforms = await Platform.findAll({ where: { id: platformIds } });
            if (!platforms.length) {
                return res.status(400).json({ error: 'Aucune plateforme trouvée pour les IDs spécifiés' });
            }
            await sequelize.models.GamePlatforms.destroy({ where: { GameId } });
            await sequelize.models.GamePlatforms.bulkCreate(platformIds.map(id => ({ GameId, PlatformId: id })));
        }
        // Rechercher et associer les genres
        if (genreIds.length > 0) {
            console.log('Association des genres:', genreIds);
            const genres = await Genre.findAll({ where: { id: genreIds } });
            console.log('Genres trouvés:', genres.map(g => g.toJSON().id));
            if (!genres.length) {
                return res.status(400).json({ error: 'Aucun genre trouvé pour les IDs spécifiés' });
            }
            await sequelize.models.GameGenres.destroy({ where: { GameId } });
            const genreAssociations = genreIds.map(id => ({ GameId, GenreId: id }));
            console.log('Création des associations de genres:', genreAssociations);
            await sequelize.models.GameGenres.bulkCreate(genreAssociations);
        }
        // Rechercher et associer les tags
        if (tagIds.length > 0) {
            console.log('Association des tags:', tagIds);
            const tags = await Tag.findAll({ where: { id: tagIds } });
            console.log('Tags trouvés:', tags.map(t => t.toJSON().id));
            if (!tags.length) {
                return res.status(400).json({ error: 'Aucun tag trouvé pour les IDs spécifiés' });
            }
            await sequelize.models.GameTags.destroy({ where: { GameId } });
            const tagAssociations = tagIds.map(id => ({ GameId, TagId: id }));
            console.log('Création des associations de tags:', tagAssociations);
            await sequelize.models.GameTags.bulkCreate(tagAssociations);
        }
        // Récupérer le jeu mis à jour avec toutes ses relations
        const updatedGame = await Game.findByPk(GameId, {
            include: [
                { model: Controller, as: 'controllers' },
                { model: Platform, as: 'platforms' },
                { model: Genre, as: 'genres' },
                { model: Tag, as: 'tags' },
                { model: Status, as: 'status' },
                { model: Language, as: 'language' }
            ]
        });
        if (updatedGame) {
            const gameJSON = updatedGame.toJSON();
            console.log('Jeu mis à jour:', {
                id: gameJSON.id,
                genres: gameJSON.genres?.map((g) => g.id),
                tags: gameJSON.tags?.map((t) => t.id)
            });
        }
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
GameRoute.delete('/delete/:id', authorizeRole(['admin', 'developer', 'superadmin']), async (req, res) => {
    const gameId = req.params.id;
    try {
        const game = await Game.findByPk(gameId);
        if (!game) {
            return res.status(404).json({ message: "Jeu non trouvé" });
        }
        // Supprimer d'abord les associations dans les tables de jointure
        await sequelize.models.GameControllers.destroy({ where: { GameId: gameId } });
        await sequelize.models.GamePlatforms.destroy({ where: { GameId: gameId } });
        await sequelize.models.GameGenres.destroy({ where: { GameId: gameId } });
        await sequelize.models.GameTags.destroy({ where: { GameId: gameId } });
        // Supprimer le jeu
        await game.destroy();
        res.status(200).json({ message: "Jeu supprimé avec succès" });
    }
    catch (error) {
        console.error("Erreur lors de la suppression du jeu :", error);
        res.status(500).json({ message: "Erreur serveur lors de la suppression du jeu" });
    }
});
GameRoute.put('/update/:id', authorizeRole(['admin', 'developer', 'superadmin']), async (req, res) => {
    const gameId = req.params.id;
    const { title, description, price, authorStudio, madewith, StatusId, LanguageId } = req.body;
    try {
        const game = await Game.findByPk(gameId);
        if (!game) {
            return res.status(404).json({ message: "Jeu non trouvé" });
        }
        // Mettre à jour les champs du jeu avec la date de mise à jour
        await game.update({
            title,
            description,
            price,
            authorStudio,
            madewith,
            StatusId,
            LanguageId,
            updatedAt: new Date() // Force la mise à jour de la date
        });
        res.status(200).json({ message: "Jeu mis à jour avec succès", game });
    }
    catch (error) {
        console.error("Erreur lors de la mise à jour du jeu :", error);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour du jeu" });
    }
});
GameRoute.get('/last-updated', async (req, res) => {
    try {
        const games = await Game.findAll({
            order: [['updatedAt', 'DESC']],
            limit: 5
        });
        res.status(200).json(games);
    }
    catch (error) {
        console.error("Erreur lors de la récupération des jeux mis à jour :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des jeux mis à jour" });
    }
});
// Route pour récupérer les jeux d'un développeur spécifique
GameRoute.get('/developer/:developerId', authorizeRole(['admin', 'developer', 'superadmin']), async (req, res) => {
    try {
        const developerId = req.params.developerId;
        const games = await Game.findAll({
            where: { UserId: developerId },
            include: [
                { model: Status, as: 'status' },
                { model: Language, as: 'language' }
            ]
        });
        res.status(200).json(games);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux du développeur:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux du développeur' });
    }
});
// Route pour récupérer les statistiques des jeux
GameRoute.get('/stats', authorizeRole(['admin', 'superadmin']), async (req, res) => {
    try {
        const totalGames = await Game.count();
        const totalPrice = await Game.sum('price');
        const averagePrice = totalPrice / totalGames;
        const gamesByStatus = await Game.findAll({
            attributes: ['StatusId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['StatusId'],
            include: [{ model: Status, as: 'status' }]
        });
        const gamesByLanguage = await Game.findAll({
            attributes: ['LanguageId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['LanguageId'],
            include: [{ model: Language, as: 'language' }]
        });
        res.status(200).json({
            totalGames,
            averagePrice,
            gamesByStatus,
            gamesByLanguage
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
});
// Route pour récupérer les jeux les plus récents
GameRoute.get('/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const games = await Game.findAll({
            order: [['createdAt', 'DESC']],
            limit,
            include: [
                { model: Status, as: 'status' },
                { model: Language, as: 'language' }
            ]
        });
        res.status(200).json(games);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux récents:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux récents' });
    }
});
// Route pour récupérer les jeux les plus chers
GameRoute.get('/most-expensive', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const games = await Game.findAll({
            order: [['price', 'DESC']],
            limit,
            include: [
                { model: Status, as: 'status' },
                { model: Language, as: 'language' }
            ]
        });
        res.status(200).json(games);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux les plus chers:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux les plus chers' });
    }
});
// Route pour récupérer les jeux par statut
GameRoute.get('/by-status/:statusId', async (req, res) => {
    try {
        const statusId = req.params.statusId;
        const games = await Game.findAll({
            where: { StatusId: statusId },
            include: [
                { model: Status, as: 'status' },
                { model: Language, as: 'language' }
            ]
        });
        res.status(200).json(games);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux par statut:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux par statut' });
    }
});
// Route pour récupérer les jeux par langue
GameRoute.get('/by-language/:languageId', async (req, res) => {
    try {
        const languageId = req.params.languageId;
        const games = await Game.findAll({
            where: { LanguageId: languageId },
            include: [
                { model: Status, as: 'status' },
                { model: Language, as: 'language' }
            ]
        });
        res.status(200).json(games);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux par langue:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux par langue' });
    }
});
// Route pour récupérer les jeux par prix (intervalle)
GameRoute.get('/by-price-range', async (req, res) => {
    try {
        const minPrice = parseFloat(req.query.min) || 0;
        const maxPrice = parseFloat(req.query.max) || 100;
        const games = await Game.findAll({
            where: {
                price: {
                    [Op.between]: [minPrice, maxPrice]
                }
            },
            include: [
                { model: Status, as: 'status' },
                { model: Language, as: 'language' }
            ]
        });
        res.status(200).json(games);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux par prix:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux par prix' });
    }
});
// Route pour récupérer les jeux avec leurs relations complètes
GameRoute.get('/with-relations/:id', async (req, res) => {
    try {
        const gameId = req.params.id;
        const game = await Game.findByPk(gameId, {
            include: [
                { model: Status, as: 'status' },
                { model: Language, as: 'language' },
                { model: Controller, as: 'controllers' },
                { model: Platform, as: 'platforms' },
                { model: Genre, as: 'genres' },
                { model: Tag, as: 'tags' }
            ]
        });
        if (!game) {
            return res.status(404).json({ error: 'Jeu non trouvé' });
        }
        res.status(200).json(game);
    }
    catch (error) {
        console.error('Erreur lors de la récupération du jeu avec ses relations:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du jeu avec ses relations' });
    }
});
// Route pour récupérer les jeux par UserId
GameRoute.get('/by-user/:userId', authorizeRole(['developer']), async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log('Fetching games for user ID:', userId);
        const games = await Game.findAll({
            where: { UserId: userId },
            include: [
                { model: Status, as: 'status' },
                { model: Language, as: 'language' },
                { model: Controller, as: 'controllers' },
                { model: Platform, as: 'platforms' },
                { model: Genre, as: 'genres' },
                { model: Tag, as: 'tags' },
                { model: User, as: 'gameOwner' }
            ]
        });
        if (!games || games.length === 0) {
            return res.status(404).json({ message: 'Aucun jeu trouvé pour cet utilisateur' });
        }
        res.status(200).json(games);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});
