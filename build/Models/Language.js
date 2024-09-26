import { Router } from "express";
import { sequelize } from "../database.js";
import { DataTypes } from "sequelize";
export const Language = sequelize.define("Language", {
    name: {
        type: DataTypes.STRING(100),
        validate: {
            notNull: false
        }
    },
    description: {
        type: DataTypes.STRING(500),
        validate: {
            notNull: false
        }
    }
});
export const LanguageRoute = Router();
LanguageRoute.post('/new', async (req, res) => {
    try {
        const languages = [
            {
                "name": "English",
                "description": "English is the most widely used language in the world."
            },
            {
                "name": "French",
                "description": "French is a Romance language spoken in France and many other countries."
            },
            {
                "name": "Spanish",
                "description": "Spanish is spoken by over 460 million people worldwide."
            },
            {
                "name": "German",
                "description": "German is the official language of Germany, Austria, and Switzerland."
            },
            {
                "name": "Chinese",
                "description": "Chinese, primarily Mandarin, is the most spoken language in the world."
            },
            {
                "name": "Japanese",
                "description": "Japanese is spoken by over 125 million people, primarily in Japan."
            },
            {
                "name": "Russian",
                "description": "Russian is an East Slavic language spoken by over 150 million people."
            },
            {
                "name": "Arabic",
                "description": "Arabic is the liturgical language of Islam and spoken widely in the Middle East and North Africa."
            },
            {
                "name": "Portuguese",
                "description": "Portuguese is the official language of Portugal and Brazil."
            },
            {
                "name": "Italian",
                "description": "Italian is a Romance language spoken mainly in Italy and Switzerland."
            },
            {
                "name": "Korean",
                "description": "Korean is the official language of both North and South Korea."
            },
            {
                "name": "Hindi",
                "description": "Hindi is one of the official languages of India, spoken by over 260 million people."
            },
            {
                "name": "Dutch",
                "description": "Dutch is spoken in the Netherlands and parts of Belgium."
            },
            {
                "name": "Turkish",
                "description": "Turkish is the most widely spoken of the Turkic languages, spoken in Turkey and Cyprus."
            },
            {
                "name": "Swedish",
                "description": "Swedish is spoken by over 10 million people, primarily in Sweden and Finland."
            }
        ];
        // Insérer les genres en utilisant bulkCreate
        await Language.bulkCreate(languages);
        res.status(201).json({ message: 'Languages créés avec succès !' });
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion des Languages :', error);
        res.status(500).json({ error: 'Erreur lors de l\'insertion des Languages' });
    }
});
