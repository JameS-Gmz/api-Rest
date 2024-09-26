import { Router } from "express";
import { sequelize } from "../database.js";
import { Game } from "./Game.js";
import { DataTypes, TEXT } from "sequelize";


export const Genre = sequelize.define("Genre", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    description: TEXT
});

// Définir les relations dans un fichier de configuration centralisé, si possible
Game.belongsToMany(Genre, { through: "GameGenre" });
Genre.belongsToMany(Game, { through: "GameGenre" });


export const GenreRoute = Router();

GenreRoute.post('/new', async (req, res) => {
    const genres = [
        { name: 'FPS', description: 'First-Person Shooter' },
        { name: 'Survival', description: 'Survival games' },
        { name: 'Action-Adventure', description: 'Combines elements of action and adventure' },
    ];

    try {
        // Insérer les genres en utilisant bulkCreate
        await Genre.bulkCreate(genres);
        res.status(201).json({ message: 'Genres créés avec succès !' });
    } catch (error) {
        console.error('Erreur lors de l\'insertion des genres :', error);
        res.status(500).json({ error: 'Erreur lors de l\'insertion des genres' });
    }
});
    

  

