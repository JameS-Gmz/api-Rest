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
export const GameRoute = Router();
export const Game = sequelize.define("Game", {
    title: {
        type: STRING(100),
        allowNull: true,
    },
    price: {
        type: DOUBLE,
        allowNull: true,
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
        field: 'createdAt',
        allowNull: true,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updatedAt',
        allowNull: true,
    },
    StatusId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Autoriser NULL pour éviter l'erreur
        references: {
            model: 'Statuses',
            key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    },
    LanguageId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Autoriser NULL pour éviter l'erreur
        references: {
            model: 'Languages',
            key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    }
});
GameRoute.post('/new', authorizeRole(['developer', 'admin']), async (req, res) => {
    const { title, description, price, authorStudio, madewith, StatusId, LanguageId } = req.body;
    try {
        const game = await Game.create({ title, description, price, authorStudio, madewith, StatusId, LanguageId });
        res.status(201).json(game);
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
        const games = await Game.findAll();
        res.status(200).json(games);
    }
    catch (error) {
        console.log(error);
    }
});
GameRoute.get("/id/:gameId", async (req, res) => {
    try {
        const game_id = req.params.gameId;
        const game = await Game.findByPk(game_id);
        res.status(200).json(game);
    }
    catch (error) {
        console.log(error);
    }
});
//route qui recupere des produits selon une intervalle de pris definis par l'utilisateur
GameRoute.get("/price/:min/:max", async (req, res) => {
    try {
        const min = req.params.min;
        const max = req.params.max;
        const games = await Game.findAll({
            where: {
                price: {
                    [Op.between]: [min, max]
                }
            }
        });
        res.status(200).json(games);
    }
    catch (error) {
        console.log(error);
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
    const { GameId, ControllerId, PlatformId, StatusId, LanguageId, tagId, genreId } = req.body;
    // Convertir en tableau d'IDs si nécessaire
    const controllerIds = Array.isArray(ControllerId) ? ControllerId.map(id => parseInt(id, 10)) : [parseInt(ControllerId, 10)];
    const platformIds = Array.isArray(PlatformId) ? PlatformId.map(id => parseInt(id, 10)) : [parseInt(PlatformId, 10)];
    const tagIds = Array.isArray(tagId) ? tagId.map(id => parseInt(id, 10)) : [];
    const genreIds = Array.isArray(genreId) ? genreId.map(id => parseInt(id, 10)) : [];
    try {
        // Vérifier que le jeu existe
        const game = await Game.findByPk(GameId);
        if (!game) {
            return res.status(404).json({ error: 'Jeu non trouvé' });
        }
        // Vérifier que le statut existe
        const status = await Status.findByPk(StatusId);
        if (!status) {
            return res.status(404).json({ error: 'Statut non trouvé' });
        }
        // Mettre à jour le jeu avec le statut
        game.dataValues.StatusId = StatusId;
        await game.save();
        // Vérifier que la langue existe
        const language = await Language.findByPk(LanguageId);
        if (!language) {
            return res.status(404).json({ error: 'Langue non trouvée' });
        }
        // Mettre à jour le jeu avec la langue
        game.dataValues.LanguageId = LanguageId;
        await game.save();
        // Rechercher et associer les contrôleurs
        const controllers = await Controller.findAll({ where: { id: controllerIds } });
        if (!controllers.length) {
            return res.status(400).json({ error: 'Aucun contrôleur trouvé pour les IDs spécifiés' });
        }
        await sequelize.models.GameControllers.bulkCreate(controllerIds.map(id => ({ GameId, ControllerId: id })));
        // Rechercher et associer les plateformes
        const platforms = await Platform.findAll({ where: { id: platformIds } });
        if (!platforms.length) {
            return res.status(400).json({ error: 'Aucune plateforme trouvée pour les IDs spécifiés' });
        }
        await sequelize.models.GamePlatforms.bulkCreate(platformIds.map(id => ({ GameId, PlatformId: id })));
        // Rechercher et associer les genres
        if (genreIds.length) {
            const genres = await Genre.findAll({ where: { id: genreIds } });
            if (!genres.length) {
                return res.status(400).json({ error: 'Aucun genre trouvé pour les IDs spécifiés' });
            }
            await sequelize.models.GameGenres.bulkCreate(genreIds.map(id => ({ GameId, GenreId: id })));
        }
        // Rechercher et associer les tags
        if (tagIds.length) {
            const tags = await Tag.findAll({ where: { id: tagIds } });
            if (!tags.length) {
                return res.status(400).json({ error: 'Aucun tag trouvé pour les IDs spécifiés' });
            }
            await sequelize.models.GameTags.bulkCreate(tagIds.map(id => ({ GameId, TagId: id })));
        }
        res.status(200).json({ message: 'Jeu mis à jour avec succès avec les contrôleurs, plateformes, genres, tags et statut.' });
    }
    catch (error) {
        console.error('Erreur lors de l\'association des catégories:', error);
        res.status(500).json({ error: 'Erreur lors de l\'association des catégories' });
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
// GameRoute.post('/filter', async (req, res) => {
//   const { genre, platform, language, controller, status, tag } = req.body;  // Filtres envoyés par le client
//   try {
//     // Construire les conditions de la requête Sequelize
//     const whereConditions = {};
//     if (genre) whereConditions.genreId = genre;
//     if (platform) whereConditions.platformId = platform;
//     if (language) whereConditions.languageId = language;
//     if (controller) whereConditions.controllerId = controller;
//     if (status) whereConditions.statusId = status;
//     if (tag) whereConditions.tagId = tag;
//     // Trouver les jeux en fonction des filtres
//     const games = await Game.findAll({
//       where: whereConditions,
//       include: [
//         { model: Genre, as: 'genre' },
//         { model: Platform, as: 'platform' },
//         { model: Language, as: 'language' },
//         { model: Controller, as: 'controller' },
//         { model: Status, as: 'status' },
//         { model: Tag, as: 'tag' }
//       ]
//     });
//     res.json(games);
//   } catch (error) {
//     console.error('Erreur lors de la récupération des jeux filtrés :', error);
//     res.status(500).json({ error: 'Erreur serveur lors de la récupération des jeux' });
//   }
// });
