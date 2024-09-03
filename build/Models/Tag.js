import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { Game } from "./Game.js";
import { Router } from "express";
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
Game.belongsToMany(Tag, { through: "GameTag" });
Tag.belongsToMany(Game, { through: "GameTag" });
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
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion des tags :', error);
        res.status(500).json({ error: 'Erreur lors de l\'insertion des tags' });
    }
});
