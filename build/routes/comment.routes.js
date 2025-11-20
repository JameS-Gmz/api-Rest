import { Router } from 'express';
import { db } from '../database-drizzle.js';
import { comments, users, games } from '../Models/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { verifyToken } from '../middleware/authRole.js';
export const commentRoutes = Router();
// Log pour confirmer que les routes sont chargées
console.log('✅ Routes de commentaires chargées');
// GET /game/:gameId - Récupérer tous les commentaires d'un jeu avec les informations utilisateur
commentRoutes.get('/game/:gameId', async (req, res) => {
    try {
        const gameId = parseInt(req.params.gameId);
        const gameComments = await db.select({
            comment: comments,
            user: {
                id: users.id,
                username: users.username,
                avatar: users.avatar,
            }
        })
            .from(comments)
            .innerJoin(users, eq(comments.UserId, users.id))
            .where(eq(comments.GameId, gameId))
            .orderBy(desc(comments.createdAt));
        const formattedComments = gameComments.map(item => ({
            id: item.comment.id,
            content: item.comment.content,
            rating: item.comment.rating,
            createdAt: item.comment.createdAt,
            updatedAt: item.comment.updatedAt,
            user: {
                id: item.user.id,
                username: item.user.username,
                avatar: item.user.avatar,
            }
        }));
        // Calculer la note moyenne
        const ratings = formattedComments
            .filter(c => c.rating !== null && c.rating !== undefined)
            .map(c => c.rating);
        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            : 0;
        res.status(200).json({
            comments: formattedComments,
            averageRating: Math.round(averageRating * 10) / 10, // Arrondir à 1 décimale
            totalComments: formattedComments.length,
            totalRatings: ratings.length
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
    }
});
// POST /create - Créer un nouveau commentaire avec note
commentRoutes.post('/create', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id ? parseInt(req.user.id) : null;
        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }
        const { GameId, content, rating } = req.body;
        if (!GameId) {
            return res.status(400).json({ error: 'GameId est requis' });
        }
        // Vérifier que le jeu existe
        const game = await db.select().from(games).where(eq(games.id, parseInt(GameId))).limit(1);
        if (game.length === 0) {
            return res.status(404).json({ error: 'Jeu non trouvé' });
        }
        // Vérifier si l'utilisateur a déjà commenté ce jeu
        const existingComment = await db.select()
            .from(comments)
            .where(and(eq(comments.UserId, userId), eq(comments.GameId, parseInt(GameId))))
            .limit(1);
        if (existingComment.length > 0) {
            return res.status(400).json({ error: 'Vous avez déjà commenté ce jeu. Utilisez PUT pour modifier votre commentaire.' });
        }
        // Valider la note (1-5)
        let validRating = null;
        if (rating !== undefined && rating !== null) {
            const ratingNum = parseInt(rating);
            if (ratingNum >= 1 && ratingNum <= 5) {
                validRating = ratingNum;
            }
            else {
                return res.status(400).json({ error: 'La note doit être entre 1 et 5' });
            }
        }
        // Créer le commentaire
        await db.insert(comments).values({
            UserId: userId,
            GameId: parseInt(GameId),
            content: content || null,
            rating: validRating,
        });
        // Récupérer le commentaire créé avec les informations utilisateur
        const [newComment] = await db.select({
            comment: comments,
            user: {
                id: users.id,
                username: users.username,
                avatar: users.avatar,
            }
        })
            .from(comments)
            .innerJoin(users, eq(comments.UserId, users.id))
            .where(and(eq(comments.UserId, userId), eq(comments.GameId, parseInt(GameId))))
            .orderBy(desc(comments.createdAt))
            .limit(1);
        const formattedComment = {
            id: newComment.comment.id,
            content: newComment.comment.content,
            rating: newComment.comment.rating,
            createdAt: newComment.comment.createdAt,
            updatedAt: newComment.comment.updatedAt,
            user: {
                id: newComment.user.id,
                username: newComment.user.username,
                avatar: newComment.user.avatar,
            }
        };
        res.status(201).json(formattedComment);
    }
    catch (error) {
        console.error('Erreur lors de la création du commentaire:', error);
        res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
    }
});
// PUT /update/:commentId - Mettre à jour un commentaire
commentRoutes.put('/update/:commentId', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id ? parseInt(req.user.id) : null;
        const commentId = parseInt(req.params.commentId);
        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }
        const { content, rating } = req.body;
        // Vérifier que le commentaire existe et appartient à l'utilisateur
        const existingComment = await db.select()
            .from(comments)
            .where(eq(comments.id, commentId))
            .limit(1);
        if (existingComment.length === 0) {
            return res.status(404).json({ error: 'Commentaire non trouvé' });
        }
        if (existingComment[0].UserId !== userId) {
            return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier ce commentaire' });
        }
        // Valider la note (1-5)
        let validRating = existingComment[0].rating;
        if (rating !== undefined && rating !== null) {
            const ratingNum = parseInt(rating);
            if (ratingNum >= 1 && ratingNum <= 5) {
                validRating = ratingNum;
            }
            else {
                return res.status(400).json({ error: 'La note doit être entre 1 et 5' });
            }
        }
        // Mettre à jour le commentaire
        await db.update(comments)
            .set({
            content: content !== undefined ? content : existingComment[0].content,
            rating: validRating,
            updatedAt: new Date(),
        })
            .where(eq(comments.id, commentId));
        // Récupérer le commentaire mis à jour avec les informations utilisateur
        const [updatedComment] = await db.select({
            comment: comments,
            user: {
                id: users.id,
                username: users.username,
                avatar: users.avatar,
            }
        })
            .from(comments)
            .innerJoin(users, eq(comments.UserId, users.id))
            .where(eq(comments.id, commentId))
            .limit(1);
        const formattedComment = {
            id: updatedComment.comment.id,
            content: updatedComment.comment.content,
            rating: updatedComment.comment.rating,
            createdAt: updatedComment.comment.createdAt,
            updatedAt: updatedComment.comment.updatedAt,
            user: {
                id: updatedComment.user.id,
                username: updatedComment.user.username,
                avatar: updatedComment.user.avatar,
            }
        };
        res.status(200).json(formattedComment);
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour du commentaire:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du commentaire' });
    }
});
// DELETE /delete/:commentId - Supprimer un commentaire
commentRoutes.delete('/delete/:commentId', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id ? parseInt(req.user.id) : null;
        const commentId = parseInt(req.params.commentId);
        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }
        // Vérifier que le commentaire existe et appartient à l'utilisateur
        const existingComment = await db.select()
            .from(comments)
            .where(eq(comments.id, commentId))
            .limit(1);
        if (existingComment.length === 0) {
            return res.status(404).json({ error: 'Commentaire non trouvé' });
        }
        if (existingComment[0].UserId !== userId) {
            return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à supprimer ce commentaire' });
        }
        // Supprimer le commentaire
        await db.delete(comments).where(eq(comments.id, commentId));
        res.status(200).json({ message: 'Commentaire supprimé avec succès' });
    }
    catch (error) {
        console.error('Erreur lors de la suppression du commentaire:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' });
    }
});
// GET /user/:userId - Récupérer tous les commentaires d'un utilisateur
commentRoutes.get('/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const userComments = await db.select({
            comment: comments,
            game: {
                id: games.id,
                title: games.title,
            }
        })
            .from(comments)
            .innerJoin(games, eq(comments.GameId, games.id))
            .where(eq(comments.UserId, userId))
            .orderBy(desc(comments.createdAt));
        const formattedComments = userComments.map(item => ({
            id: item.comment.id,
            content: item.comment.content,
            rating: item.comment.rating,
            createdAt: item.comment.createdAt,
            updatedAt: item.comment.updatedAt,
            game: {
                id: item.game.id,
                title: item.game.title,
            }
        }));
        res.status(200).json(formattedComments);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des commentaires de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
    }
});
