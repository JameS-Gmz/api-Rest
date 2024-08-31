import { Router } from 'express';
import { Game } from './Game.js';
import { Genre } from './Genre.js';
export const GameGenresRoute = Router();
GameGenresRoute.post('/associate-genres', async (req, res) => {
    try {
        const { gameId, genreIds } = req.body;
        if (!gameId || !Array.isArray(genreIds) || genreIds.length === 0) {
            return res.status(400).json({ error: 'Invalid request data' });
        }
        const game = await Game.findByPk(gameId);
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        // Trouver les genres par leurs IDs
        const genres = await Genre.findAll({
            where: {
                id: genreIds
            }
        });
        if (genres.length !== genreIds.length) {
            return res.status(404).json({ error: 'Some genres not found' });
        }
        res.status(200).json({ message: 'Genres associated successfully' });
    }
    catch (error) {
        console.error('Error associating genres:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
