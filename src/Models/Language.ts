import { Router } from "express";
import { sequelize } from "../database.js";
import { DataTypes } from "sequelize";
import { Game } from "./Game.js";

export const Language = sequelize.define("Language", {
    name: {
        type: DataTypes.STRING(100),
        validate: {
          notNull: false
        }
      },
      description: {
        type : DataTypes.STRING(500),
        validate: {
          notNull: false
        }
      }
});

export const LanguageRoute = Router()

LanguageRoute.post('/new', async (req, res) => {
    try {
        const languages = [{}];

        // Insérer les genres en utilisant bulkCreate
        await Language.bulkCreate(languages);
        res.status(201).json({ message: 'Languages créés avec succès !' });

    } catch (error) {
        console.error('Erreur lors de l\'insertion des Languages :', error);
        res.status(500).json({ error: 'Erreur lors de l\'insertion des Languages' });
    }

});

LanguageRoute.get('/games/:languageId', async (req, res) => {
    const { languageId } = req.params;

    try {
        // Vérifier si le langage existe
        const language = await Language.findByPk(languageId);

        if (!language) {
            return res.status(404).json({ error: 'Langue non trouvée' });
        }

        // Récupérer les jeux associés au langage
        const games = await Game.findAll({
            where: { LanguageId: languageId }
        });

        if (games.length === 0) {
            return res.status(404).json({ message: 'Aucun jeu trouvé pour cette langue' });
        }

        res.status(200).json(games);
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux selon la langue :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});

LanguageRoute.get('/all', async (req, res) => {
    try {
      const languages = await Language.findAll();
      res.json(languages);
    } catch (error) {
      console.error('Erreur lors de la récupération des langues :', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des langues' });
    }
  });
