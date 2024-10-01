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
        const platforms = [{}];
        // Insérer les genres en utilisant bulkCreate
        await Platform.bulkCreate(platforms);
        res.status(201).json({ message: 'platforms créés avec succès !' });
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion des plateformes :', error);
        res.status(500).json({ error: 'Erreur lors de l\'insertion des plateformes' });
    }
});
PlatformRoute.get('/games/:id', async (req, res) => {
    const platformId = req.params.id;
    try {
        const platform = await Platform.findByPk(platformId);
        if (!platform) {
            return res.status(404).json({ error: 'Plateforme non trouvée' });
        }
        res.json(platform);
    }
    catch (error) {
        console.error('Erreur lors de la récupération de la plateforme :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la plateforme' });
    }
});
PlatformRoute.get('/all', async (req, res) => {
    try {
        const platforms = await Platform.findAll();
        res.json(platforms);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des plateformes :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des plateformes' });
    }
});
