import { Router } from "express";
import { sequelize } from "../database.js";
export const GameGenre = sequelize.define("GameGenre", {});
const GameGenreRoute = Router();
GameGenreRoute.post('/associate-genres', async (req, res) => {
    try {
        const associations = req.body; // [{ gameId: 1, genreId: 2 }, { gameId: 1, genreId: 4 }]
        // Associer les genres
        for (const { gameId, genreId } of associations) {
            await GameGenre.create({ gameId, genreId }); // Assurez-vous que `GameGenre` est votre table de jointure
        }
        res.status(201).json({ message: 'Genres associés avec succès !' });
    }
    catch (error) {
        console.error('Erreur lors de l\'association des genres :', error);
        res.status(500).json({ error: 'Erreur lors de l\'association des genres' });
    }
});
