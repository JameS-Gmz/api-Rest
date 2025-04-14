import express from 'express';
import { Game } from '../Models/Game';
import { verifyToken } from '../middleware/authRole';
const router = express.Router();
// Routes publiques (accessibles sans authentification)
router.get('/games', async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des jeux' });
    }
});
router.get('/games/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Jeu non trouvé' });
        }
        res.json(game);
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du jeu' });
    }
});
// Routes protégées (nécessitent une authentification)
router.post('/games', verifyToken, async (req, res) => {
    if (req.user.role === 'guest') {
        return res.status(401).json({ message: 'Authentification requise pour créer un jeu' });
    }
    try {
        const game = new Game(req.body);
        await game.save();
        res.status(201).json(game);
    }
    catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création du jeu' });
    }
});
router.put('/games/:id', verifyToken, async (req, res) => {
    if (req.user.role === 'guest') {
        return res.status(401).json({ message: 'Authentification requise pour modifier un jeu' });
    }
    try {
        const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!game) {
            return res.status(404).json({ message: 'Jeu non trouvé' });
        }
        res.json(game);
    }
    catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour du jeu' });
    }
});
router.delete('/games/:id', verifyToken, async (req, res) => {
    if (req.user.role === 'guest') {
        return res.status(401).json({ message: 'Authentification requise pour supprimer un jeu' });
    }
    try {
        const game = await Game.findByIdAndDelete(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Jeu non trouvé' });
        }
        res.json({ message: 'Jeu supprimé avec succès' });
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du jeu' });
    }
});
export default router;
