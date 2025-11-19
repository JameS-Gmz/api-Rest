import { Router, Request, Response } from 'express';
import { db } from '../database-drizzle.js';
import { users, roles, library, games, statuses, languages, controllers, platforms, genres, tags, gameControllers, gamePlatforms, gameGenres, gameTags } from '../Models/schema.js';
import { eq, and, or, like, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authorizeRole, secretKey, verifyToken } from '../middleware/authRole.js';

export const userRoutes = Router();

// POST /signup - Créer un nouvel utilisateur
userRoutes.post('/signup', async (req: Request, res: Response) => {
    const { username, email, password, birthday } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'L\'utilisateur existe déjà' });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);

        // Trouver le rôle par défaut (user)
        const defaultRole = await db.select().from(roles).where(eq(roles.name, 'user')).limit(1);
        if (defaultRole.length === 0) {
            return res.status(400).json({ error: 'Rôle non valide' });
        }

        // Créer le nouvel utilisateur
        await db.insert(users).values({
            username,
            email,
            password: hashedPassword,
            birthday: birthday ? new Date(birthday) : null,
            bio: '',
            avatar: '',
            RoleId: defaultRole[0].id,
        });

        // Récupérer l'utilisateur avec son rôle (par email car c'est unique)
        const userWithRole = await db.select({
            user: users,
            role: roles,
        })
        .from(users)
        .leftJoin(roles, eq(users.RoleId, roles.id))
        .where(eq(users.email, email))
        .limit(1);

        if (userWithRole.length === 0 || !userWithRole[0].role) {
            return res.status(500).json({ error: 'Erreur lors de la récupération du rôle de l\'utilisateur' });
        }

        const user = userWithRole[0].user;
        const role = userWithRole[0].role;

        // Générer le token
        const token = jwt.sign(
            {
                username: user.username,
                userId: user.id,
                email: user.email,
                role: role.name,
                bio: user.bio,
                birthday: user.birthday,
            },
            secretKey,
            { expiresIn: '2h' }
        );

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token: token
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /signin - Connexion
userRoutes.post('/signin', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const userWithRole = await db.select({
            user: users,
            role: roles,
        })
        .from(users)
        .leftJoin(roles, eq(users.RoleId, roles.id))
        .where(eq(users.email, email))
        .limit(1);

        if (userWithRole.length === 0) {
            return res.status(404).json({ message: 'Adresse e-mail ou mot de passe incorrect' });
        }

        const user = userWithRole[0].user;
        const role = userWithRole[0].role;

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect' });
        }

        const timestamp = Date.now();
        const token = jwt.sign(
            {
                username: user.username,
                userId: user.id,
                email: user.email,
                role: role?.name || 'user',
                bio: user.bio,
                birthday: user.birthday,
                timestamp: timestamp
            },
            secretKey,
            { expiresIn: '2h' }
        );

        res.status(200).json({
            message: 'Connexion réussie',
            token,
            userId: user.id,
            username: user.username,
            role: role?.name || 'user',
            bio: user.bio,
            birthday: user.birthday
        });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// PUT /profile/:id - Mettre à jour le profil
userRoutes.put('/profile/:id', authorizeRole(['user', 'developer', 'admin', 'superadmin']), async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const { username, email, bio, avatar, birthday } = req.body;

    try {
        const userWithRole = await db.select({
            user: users,
            role: roles,
        })
        .from(users)
        .leftJoin(roles, eq(users.RoleId, roles.id))
        .where(eq(users.id, userId))
        .limit(1);

        if (userWithRole.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Mise à jour de l'utilisateur
        await db.update(users)
            .set({
                username,
                email,
                bio,
                avatar,
                birthday: birthday ? new Date(birthday) : null,
            })
            .where(eq(users.id, userId));

        // Recharger l'utilisateur mis à jour
        const updatedUserWithRole = await db.select({
            user: users,
            role: roles,
        })
        .from(users)
        .leftJoin(roles, eq(users.RoleId, roles.id))
        .where(eq(users.id, userId))
        .limit(1);

        const updatedUser = updatedUserWithRole[0].user;
        const updatedRole = updatedUserWithRole[0].role;

        const token = jwt.sign(
            {
                username: updatedUser.username,
                userId: updatedUser.id,
                email: updatedUser.email,
                role: updatedRole?.name || 'user',
                bio: updatedUser.bio,
                avatar: updatedUser.avatar,
                birthday: updatedUser.birthday,
            },
            secretKey,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Profil mis à jour avec succès',
            user: updatedUser,
            token
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil :', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }
});

// GET /all - Récupérer tous les utilisateurs (admin/superadmin)
userRoutes.get('/all', authorizeRole(['admin', 'superadmin']), async (req: Request, res: Response) => {
    try {
        const allUsers = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            bio: users.bio,
            avatar: users.avatar,
            birthday: users.birthday,
            createdAt: users.createdAt,
            roleName: roles.name,
        })
        .from(users)
        .leftJoin(roles, eq(users.RoleId, roles.id));

        const formattedUsers = allUsers.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            bio: u.bio,
            avatar: u.avatar,
            birthday: u.birthday,
            createdAt: u.createdAt,
            role: u.roleName || 'user',
        }));

        res.status(200).json(formattedUsers);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs' });
    }
});

// GET /id/:id - Récupérer un utilisateur par ID
userRoutes.get('/id/:id', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);

    try {
        const user = await db.select({
            username: users.username,
            email: users.email,
            bio: users.bio,
            avatar: users.avatar,
            birthday: users.birthday,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

        if (user.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.status(200).json(user[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'utilisateur' });
    }
});

// GET /library/allgames - Récupérer tous les jeux de la bibliothèque de l'utilisateur
userRoutes.get('/library/allgames', verifyToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id ? parseInt(req.user.id) : null;

        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Récupérer les jeux de la bibliothèque avec toutes leurs relations
        const libraryGames = await db.select({
            game: games,
            status: statuses,
            language: languages,
        })
        .from(library)
        .innerJoin(games, eq(library.GameId, games.id))
        .leftJoin(statuses, eq(games.StatusId, statuses.id))
        .leftJoin(languages, eq(games.LanguageId, languages.id))
        .where(eq(library.UserId, userId));

        if (libraryGames.length === 0) {
            return res.status(404).json({ message: 'Aucun jeu trouvé dans votre bibliothèque' });
        }

        // Récupérer les relations many-to-many pour chaque jeu
        const gamesWithRelations = await Promise.all(
            libraryGames.map(async (item) => {
                const gameId = item.game.id;

                const [gameControllersList, gamePlatformsList, gameGenresList, gameTagsList] = await Promise.all([
                    db.select({ controller: controllers })
                        .from(gameControllers)
                        .innerJoin(controllers, eq(gameControllers.ControllerId, controllers.id))
                        .where(eq(gameControllers.GameId, gameId)),
                    db.select({ platform: platforms })
                        .from(gamePlatforms)
                        .innerJoin(platforms, eq(gamePlatforms.PlatformId, platforms.id))
                        .where(eq(gamePlatforms.GameId, gameId)),
                    db.select({ genre: genres })
                        .from(gameGenres)
                        .innerJoin(genres, eq(gameGenres.GenreId, genres.id))
                        .where(eq(gameGenres.GameId, gameId)),
                    db.select({ tag: tags })
                        .from(gameTags)
                        .innerJoin(tags, eq(gameTags.TagId, tags.id))
                        .where(eq(gameTags.GameId, gameId)),
                ]);

                return {
                    ...item.game,
                    status: item.status,
                    language: item.language,
                    controllers: gameControllersList.map(gc => gc.controller),
                    platforms: gamePlatformsList.map(gp => gp.platform),
                    genres: gameGenresList.map(gg => gg.genre),
                    tags: gameTagsList.map(gt => gt.tag),
                };
            })
        );

        res.status(200).json(gamesWithRelations);
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});

// POST /library/games/:gameId - Ajouter un jeu à la bibliothèque
userRoutes.post('/library/games/:gameId', verifyToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id ? parseInt(req.user.id) : null;
        const gameId = parseInt(req.params.gameId);

        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérifier si le jeu existe
        const game = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
        if (game.length === 0) {
            return res.status(404).json({ error: 'Jeu non trouvé' });
        }

        // Vérifier si le jeu est déjà dans la bibliothèque
        const existingLibrary = await db.select()
            .from(library)
            .where(and(eq(library.UserId, userId), eq(library.GameId, gameId)))
            .limit(1);

        if (existingLibrary.length > 0) {
            return res.status(400).json({ error: 'Ce jeu est déjà dans votre bibliothèque' });
        }

        // Ajouter le jeu à la bibliothèque
        await db.insert(library).values({
            UserId: userId,
            GameId: gameId,
            addedAt: new Date(),
        });

        res.status(201).json({ message: 'Jeu ajouté à votre bibliothèque avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du jeu à la bibliothèque:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout du jeu à la bibliothèque' });
    }
});

// DELETE /library/games/:gameId - Supprimer un jeu de la bibliothèque
userRoutes.delete('/library/games/:gameId', verifyToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id ? parseInt(req.user.id) : null;
        const gameId = parseInt(req.params.gameId);

        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérifier si le jeu est dans la bibliothèque
        const libraryEntry = await db.select()
            .from(library)
            .where(and(eq(library.UserId, userId), eq(library.GameId, gameId)))
            .limit(1);

        if (libraryEntry.length === 0) {
            return res.status(404).json({ error: 'Ce jeu n\'est pas dans votre bibliothèque' });
        }

        // Supprimer le jeu de la bibliothèque
        await db.delete(library)
            .where(and(eq(library.UserId, userId), eq(library.GameId, gameId)));

        res.status(200).json({ message: 'Jeu retiré de votre bibliothèque avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du jeu de la bibliothèque:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du jeu de la bibliothèque' });
    }
});

// GET /library/games/:gameId/check - Vérifier si un jeu est dans la bibliothèque
userRoutes.get('/library/games/:gameId/check', verifyToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id ? parseInt(req.user.id) : null;
        const gameId = parseInt(req.params.gameId);

        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const isInLibrary = await db.select()
            .from(library)
            .where(and(eq(library.UserId, userId), eq(library.GameId, gameId)))
            .limit(1);

        res.status(200).json(!!isInLibrary.length);
    } catch (error) {
        console.error('Erreur lors de la vérification du jeu dans la bibliothèque:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification du jeu dans la bibliothèque' });
    }
});

// GET /current-developer-id - Récupérer l'ID du développeur actuellement connecté
userRoutes.get('/current-developer-id', verifyToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id ? parseInt(req.user.id) : null;

        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérifier que l'utilisateur a le rôle de développeur
        const userWithRole = await db.select({
            user: users,
            role: roles,
        })
        .from(users)
        .leftJoin(roles, eq(users.RoleId, roles.id))
        .where(eq(users.id, userId))
        .limit(1);

        if (userWithRole.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const role = userWithRole[0].role;
        const roleName = role?.name || 'user';

        // Vérifier si l'utilisateur est un développeur
        if (roleName !== 'developer' && roleName !== 'admin' && roleName !== 'superadmin') {
            return res.status(403).json({ error: 'Accès refusé. Seuls les développeurs peuvent accéder à cette ressource.' });
        }

        res.status(200).json({ developerId: userId });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'ID du développeur:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'ID du développeur' });
    }
});

