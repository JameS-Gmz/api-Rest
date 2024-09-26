import { sequelize } from "../database.js";
import { STRING } from "sequelize";
import { Router } from "express";
export const PlatformRoute = Router();
export const Platform = sequelize.define("Platform", {
    name: {
        type: STRING(100),
        validate: {
            notNull: false
        }
    },
    description: {
        type: STRING(500),
        validate: {
            notNull: false
        }
    }
});
PlatformRoute.post('/new', async (req, res) => {
    try {
        const platforms = [
            {
                name: "Windows",
                description: "The game is available for Windows operating systems."
            },
            {
                name: "Linux",
                description: "The game is available for Linux operating systems."
            },
            {
                name: "MacOS",
                description: "The game is available for MacOS operating systems."
            },
            {
                name: "iOS",
                "description": "The game is available for iOS devices, such as iPhones and iPads."
            },
            {
                name: "Android",
                description: "The game is available for Android devices."
            },
            {
                name: "Play in Browser",
                description: "The game can be played directly in a web browser without installation."
            }
        ];
        // Insérer les genres en utilisant bulkCreate
        await Platform.bulkCreate(platforms);
        res.status(201).json({ message: 'platforms créés avec succès !' });
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion des plateformes :', error);
        res.status(500).json({ error: 'Erreur lors de l\'insertion des plateformes' });
    }
});
