import { Router } from "express";
import { sequelize } from "../database.js";
import { DataTypes } from "sequelize";
import { Game } from "./Game.js";
export const Genre = sequelize.define("Genre", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: DataTypes.CHAR(50),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
});
export const GenreRoute = Router();
GenreRoute.post("/new", async (req, res) => {
    const genres = [
        { name: 'FPS', description: 'First-Person Shooter' },
        { name: 'Survival', description: 'Survival games' },
        { name: 'Action-Adventure', description: 'Combines elements of action and adventure' },
        { name: 'RPG', description: 'Role-Playing Game' },
        { name: 'Roguelike', description: 'Dungeon crawl with permanent death' },
        { name: 'Simulation', description: 'Real-world simulation games' },
        { name: 'RTS', description: 'Real-Time Strategy' },
        { name: 'Rhythm', description: 'Music and rhythm-based games' },
        { name: 'Hack and Slash', description: 'Combat-oriented games with melee weapons' },
        { name: 'Reflection', description: 'Puzzle-based or logic games' },
        { name: 'Beat Them All', description: 'Games focused on brawling combat' },
        { name: 'Platformer', description: 'Jumping between platforms, navigating levels' },
        { name: 'TPS', description: 'Third-Person Shooter' },
        { name: 'Combat', description: 'Hand-to-hand fighting games' },
        { name: 'Battle Royale', description: 'Last player standing in an open map' },
        { name: 'MMORPG', description: 'Massively Multiplayer Online Role-Playing Game' },
        { name: 'MOBA', description: 'Multiplayer Online Battle Arena' },
        { name: 'Party Games', description: 'Multiplayer games for parties' },
        { name: 'Puzzlers', description: 'Games based on puzzle-solving' }
    ];
    try {
        const createdGenres = await Genre.bulkCreate(genres);
        res.status(201).json(createdGenres);
    }
    catch (error) {
        console.error("Erreur lors de la création des genres:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});
GenreRoute.get("/all", async (req, res) => {
    try {
        const Genres = await Genre.findAll();
        res.status(201).json(Genres);
    }
    catch (error) {
        console.error("Erreur lors de la récupération des genres:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});
GenreRoute.get('/games/:GenreId', async (req, res) => {
    const { GenreId } = req.params;
    try {
        // Vérifier si le contrôleur existe
        const controller = await Genre.findByPk(GenreId);
        if (!controller) {
            return res.status(404).json({ error: 'Contrôleur non trouvé' });
        }
        // Récupérer tous les jeux associés à ce contrôleur
        const games = await Game.findAll({
            include: [{
                    model: Genre,
                    where: { id: GenreId }, // Filtrer par le GenreId
                    through: { attributes: [] } // Exclure les attributs de la table de jointure
                }]
        });
        if (games.length === 0) {
            return res.status(404).json({ error: 'Aucun jeu trouvé pour ce contrôleur' });
        }
        res.status(200).json(games);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});
