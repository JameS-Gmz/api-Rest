import { Router } from "express";
import { sequelize } from "../database.js";
import { DataTypes, TEXT } from "sequelize";
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
    const genres = [{}];
    try {
        const createdGenres = await Genre.bulkCreate(genres);
        res.status(201).json(createdGenres);
    } catch (error) {
        console.error("Erreur lors de la création des genres:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

GenreRoute.get('/games/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Vérifier si le contrôleur existe
        const controller = await Genre.findByPk(id);
        if (!controller) {
            return res.status(404).json({ error: 'Contrôleur non trouvé' });
        }

        // Récupérer tous les jeux associés à ce contrôleur
        const games = await Game.findAll({
            include: [{
                model: Genre,
                where: { id: id }, // Filtrer par le GenreId
                through: { attributes: [] } // Exclure les attributs de la table de jointure
            }]
        });

        if (games.length === 0) {
            return res.status(404).json({ error: 'Aucun jeu trouvé pour ce contrôleur' });
        }

        res.status(200).json(games);
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});

GenreRoute.get("/all", async (req, res) => {
    try {
        const Genres = await Genre.findAll();
        res.status(201).json(Genres);
    } catch (error) {
        console.error("Erreur lors de la récupération des genres:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});


