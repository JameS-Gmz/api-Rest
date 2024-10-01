import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { Router } from "express";
import { Game } from "./Game.js";

export const TagRoute = Router();
export const Tag = sequelize.define("Tag", {

    name: {
        type: DataTypes.STRING(100),
        validate: {
            notNull: false
        }
    },
    description: DataTypes.TEXT('tiny')
});



TagRoute.post('/new', async (req, res) => {
    try {
        const tags = [
            { name: 'Free', description: 'Games available at no cost.' },
            { name: 'On Sale', description: 'Games currently discounted.' },
            { name: 'Five Euro or Less', description: 'Games priced at five euros or less.' },
            { name: 'Ten Euro or Less', description: 'Games priced at ten euros or less.' },
            { name: 'Local Multiplayer', description: 'Games with local co-op or competitive play.' },
            { name: 'Server Multiplayer', description: 'Games featuring online play via dedicated servers.' },
            { name: 'Network Multiplayer', description: 'Games supporting online multiplayer over a network.' }
        ];

        // Insérer les genres en utilisant bulkCreate
        await Tag.bulkCreate(tags);
        res.status(201).json({ message: 'Tags créés avec succès !' });

    } catch (error) {
        console.error('Erreur lors de l\'insertion des tags :', error);
        res.status(500).json({ error: 'Erreur lors de l\'insertion des tags' });
    }
});


TagRoute.get('/all', async (req, res) => {
    try {
        const Tags = await Tag.findAll();
        res.status(201).json(Tags);
    } catch (error) {
        console.error("Erreur lors de la récupération des genres:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

TagRoute.get('/games/:TagId', async (req, res) => {
    const { TagId } = req.params;
  
    try {
        // Vérifier si le contrôleur existe
        const controller = await Tag.findByPk(TagId);
        if (!controller) {
            return res.status(404).json({ error: 'Contrôleur non trouvé' });
        }
  
        // Récupérer tous les jeux associés à ce contrôleur
        const games = await Game.findAll({
            include: [{
                model: Tag,
                where: { id: TagId }, // Filtrer par le ControllerId
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
  