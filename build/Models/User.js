import { sequelize } from "../database.js";
import { DataTypes } from "sequelize";
import { Router } from "express";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { Role } from "./Role.js";
import { authorizeRole, secretKey, verifyToken } from "../middleware/authRole.js";
import { Game } from "./Game.js";
import { Status } from "./Status.js";
import { Language } from "./Language.js";
import { Controller } from "./Controller.js";
import { Platform } from "./Platform.js";
import { Genre } from "./Genre.js";
import { Tag } from "./Tag.js";
// Vérifiez que la clé secrète est bien définie
export const User = sequelize.define("User", {
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Le nom d'utilisateur ne peut pas être vide"
            }
        }
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isEmail: {
                msg: "Veuillez entrer un email valide"
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [8, 100],
                msg: "Le mot de passe doit contenir au moins 8 caractères"
            }
        }
    },
    bio: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    birthday: {
        type: DataTypes.DATE,
        allowNull: true
    },
    RoleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Roles', // Le modèle Role
            key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    },
});
export const UserRoute = Router();
UserRoute.post('/signup', async (req, res) => {
    const { username, email, password, birthday } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }
    try {
        // Vérifiez si l'utilisateur existe déjà
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'L\'utilisateur existe déjà' });
        }
        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds pour la sécurité
        // Trouver le rôle par défaut (exemple : rôle "user")
        const role = await Role.findOne({ where: { name: 'user' } });
        if (!role) {
            return res.status(400).json({ error: 'Rôle non valide' });
        }
        // Créer le nouvel utilisateur
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            birthday,
            bio: '',
            avatar: '',
            RoleId: role.dataValues.id // Assigner le rôle trouvé
        });
        // Récupérer le nouvel utilisateur avec son rôle
        const userWithRole = await User.findByPk(newUser.dataValues.id, {
            include: [{ model: Role, as: 'role' }] // Inclure le rôle de l'utilisateur
        });
        if (!userWithRole || !userWithRole.dataValues.role) {
            return res.status(500).json({ error: 'Erreur lors de la récupération du rôle de l\'utilisateur' });
        }
        // Générer le token après la création de l'utilisateur
        const token = jwt.sign({
            username: userWithRole.dataValues.username,
            userId: userWithRole.dataValues.id,
            email: userWithRole.dataValues.email,
            role: userWithRole.dataValues.role.name, // Inclure le rôle dans le token
            bio: userWithRole.dataValues.bio,
            birthday: userWithRole.dataValues.birthday
        }, secretKey, { expiresIn: '2h' });
        // Envoyer la réponse avec le token
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token: token
        });
    }
    catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
UserRoute.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email }, include: [{ model: Role, as: 'role' }] });
        if (!user) {
            return res.status(404).json({ message: 'Adresse e-mail ou mot de passe incorrect' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.dataValues.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect' });
        }
        // Générer un nouveau token avec un timestamp unique
        const timestamp = Date.now();
        const token = jwt.sign({
            username: user.dataValues.username,
            userId: user.dataValues.id,
            email: user.dataValues.email,
            role: user.dataValues.role ? user.dataValues.role.name : 'user',
            bio: user.dataValues.bio,
            birthday: user.dataValues.birthday,
            timestamp: timestamp // Ajouter le timestamp pour rendre chaque token unique
        }, secretKey, { expiresIn: '2h' });
        // Stocker le nouveau token dans la réponse
        res.status(200).json({
            message: 'Connexion réussie',
            token,
            userId: user.dataValues.id,
            username: user.dataValues.username,
            role: user.dataValues.role?.name,
            bio: user.dataValues.bio,
            birthday: user.dataValues.birthday
        });
    }
    catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
UserRoute.put('/profile/:id', authorizeRole(['user', 'developer', 'admin', 'superadmin']), async (req, res) => {
    const userId = req.params.id;
    const { username, email, bio, avatar, birthday, role } = req.body;
    try {
        // Rechercher l'utilisateur avec son rôle
        const user = await User.findByPk(userId, { include: [{ model: Role, as: 'role' }] });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        // Mise à jour de l'utilisateur
        await user.update({ username, email, bio, avatar, birthday, role });
        // Recharger l'utilisateur mis à jour avec son rôle
        const updatedUser = await User.findByPk(userId, { include: [{ model: Role, as: 'role' }] });
        // Générer un nouveau token avec les infos à jour
        const token = jwt.sign({
            username: updatedUser?.dataValues.username,
            userId: updatedUser?.dataValues.id,
            email: updatedUser?.dataValues.email,
            role: updatedUser?.dataValues.role.name ? updatedUser?.dataValues.role.name : 'user',
            bio: updatedUser?.dataValues.bio,
            avatar: updatedUser?.dataValues.avatar,
            birthday: updatedUser?.dataValues.birthday,
        }, secretKey, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Profil mis à jour avec succès',
            user: updatedUser,
            token
        });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour du profil :', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }
});
UserRoute.post('/assign-developer/:userId', authorizeRole(['user', 'admin', 'superadmin']), async (req, res) => {
    const userId = req.params.userId;
    try {
        // Récupérer le rôle "developer"
        const developerRole = await Role.findOne({ where: { name: 'developer' } });
        if (!developerRole) {
            return res.status(404).json({ message: "Le rôle 'developer' n'existe pas" });
        }
        // Récupérer l'utilisateur
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        // Mettre à jour l'utilisateur avec le RoleId du développeur
        await user.update({ RoleId: developerRole.dataValues.id });
        // Recharger les relations de l'utilisateur, y compris le rôle
        await user.reload({ include: [{ model: Role, as: 'role' }] });
        // Générer un nouveau token JWT avec le rôle mis à jour
        const token = jwt.sign({
            username: user.dataValues.username,
            userId: user.dataValues.id,
            email: user.dataValues.email,
            role: user.dataValues.role ? user.dataValues.role.name : 'user' // Rôle mis à jour
        }, secretKey, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Rôle "developer" attribué avec succès et token régénéré',
            token, // Envoyer le nouveau token
            userId: user.dataValues.id,
            username: user.dataValues.username,
            role: user.dataValues.role ? user.dataValues.role.name : 'user'
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'attribution du rôle :', error);
        res.status(500).json({ message: 'Erreur lors de l\'attribution du rôle' });
    }
});
UserRoute.post('/assign-admin/:userId', authorizeRole(['admin', 'superadmin']), async (req, res) => {
    const userId = req.params.userId;
    try {
        // Récupérer le rôle "admin"
        const adminRole = await Role.findOne({ where: { name: 'admin' } });
        if (!adminRole) {
            return res.status(404).json({ message: "Le rôle 'admin' n'existe pas" });
        }
        // Récupérer l'utilisateur
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        // Mettre à jour l'utilisateur avec le RoleId de l'admin
        await user.update({ RoleId: adminRole.dataValues.id });
        // Recharger les relations de l'utilisateur, y compris le rôle
        await user.reload({ include: [{ model: Role, as: 'role' }] });
        // Générer un nouveau token JWT avec le rôle mis à jour
        const token = jwt.sign({
            username: user.dataValues.username,
            userId: user.dataValues.id,
            email: user.dataValues.email,
            role: user.dataValues.role ? user.dataValues.role.name : 'user' // Rôle mis à jour
        }, secretKey, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Rôle "admin" attribué avec succès et token régénéré',
            token, // Envoyer le nouveau token
            userId: user.dataValues.id,
            username: user.dataValues.username,
            role: user.dataValues.role ? user.dataValues.role.name : 'user'
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'attribution du rôle :', error);
        res.status(500).json({ message: 'Erreur lors de l\'attribution du rôle' });
    }
});
UserRoute.post('/assign-user/:userId', authorizeRole(['admin', 'superadmin']), async (req, res) => {
    const userId = req.params.userId;
    try {
        // Récupérer le rôle "user"
        const userRole = await Role.findOne({ where: { name: 'user' } });
        if (!userRole) {
            return res.status(404).json({ message: "Le rôle 'user' n'existe pas" });
        }
        // Récupérer l'utilisateur
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        // Mettre à jour l'utilisateur avec le RoleId de l'user
        await user.update({ RoleId: userRole.dataValues.id });
        // Recharger les relations de l'utilisateur, y compris le rôle
        await user.reload({ include: [{ model: Role, as: 'role' }] });
        // Générer un nouveau token JWT avec le rôle mis à jour
        const token = jwt.sign({
            username: user.dataValues.username,
            userId: user.dataValues.id,
            email: user.dataValues.email,
            role: user.dataValues.role ? user.dataValues.role.name : 'user' // Rôle mis à jour
        }, secretKey, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Rôle "user" attribué avec succès et token régénéré',
            token, // Envoyer le nouveau token
            userId: user.dataValues.id,
            username: user.dataValues.username,
            role: user.dataValues.role ? user.dataValues.role.name : 'user'
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'attribution du rôle :', error);
        res.status(500).json({ message: 'Erreur lors de l\'attribution du rôle' });
    }
});
UserRoute.post('/assign-superadmin/:userId', authorizeRole(['superadmin', 'user', 'developer', 'admin']), async (req, res) => {
    const userId = req.params.userId;
    try {
        // Récupérer le rôle "superadmin"
        const superadminRole = await Role.findOne({ where: { name: 'superadmin' } });
        if (!superadminRole) {
            return res.status(404).json({ message: "Le rôle 'superadmin' n'existe pas" });
        }
        // Récupérer l'utilisateur
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        // Mettre à jour l'utilisateur avec le RoleId du superadmin
        await user.update({ RoleId: superadminRole.dataValues.id });
        // Recharger les relations de l'utilisateur, y compris le rôle
        await user.reload({ include: [{ model: Role, as: 'role' }] });
        // Générer un nouveau token JWT avec le rôle mis à jour
        const token = jwt.sign({
            username: user.dataValues.username,
            userId: user.dataValues.id,
            email: user.dataValues.email,
            role: user.dataValues.role ? user.dataValues.role.name : 'superadmin' // Rôle mis à jour
        }, secretKey, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Rôle "superadmin" attribué avec succès et token régénéré',
            token, // Envoyer le nouveau token
            userId: user.dataValues.id,
            username: user.dataValues.username,
            role: user.dataValues.role ? user.dataValues.role.name : 'superadmin'
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'attribution du rôle :', error);
        res.status(500).json({ message: 'Erreur lors de l\'attribution du rôle' });
    }
});
UserRoute.get('/all', authorizeRole(['admin', 'superadmin']), async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{
                    model: Role,
                    as: 'role',
                    attributes: ['name'] // Spécifier explicitement les attributs du rôle
                }],
            attributes: ['id', 'username', 'email', 'bio', 'avatar', 'birthday', 'createdAt'] // Spécifier les attributs de l'utilisateur
        });
        // Transformer les données pour s'assurer que le rôle est correctement formaté
        const formattedUsers = users.map(user => ({
            ...user.dataValues,
            role: user.dataValues.role ? user.dataValues.role.name : 'user' // Assurer que le rôle est toujours présent
        }));
        res.status(200).json(formattedUsers);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs' });
    }
});
UserRoute.get('/check-token', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        const expirationDate = new Date(decoded.exp * 1000); // Convertir le timestamp Unix en Date
        const currentDate = new Date();
        const timeLeft = Math.floor((expirationDate.getTime() - currentDate.getTime()) / 1000); // Temps restant en secondes
        res.status(200).json({
            isValid: true,
            expiresIn: timeLeft,
            expirationDate: expirationDate.toISOString()
        });
    }
    catch (error) {
        res.status(401).json({
            isValid: false,
            message: 'Token invalide ou expiré'
        });
    }
});
UserRoute.get('/id/:id', async (req, res) => {
    const userId = req.params.id; // Récupérer l'ID de l'utilisateur depuis les paramètres de la requête
    try {
        // Rechercher l'utilisateur par ID
        const user = await User.findByPk(userId, {
            attributes: ['username', 'email', 'bio', 'avatar', 'birthday', 'createdAt'] // Choisir les champs que vous souhaitez renvoyer
        });
        // Si l'utilisateur n'est pas trouvé
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        // Renvoyer les informations de l'utilisateur
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération de l'utilisateur" });
    }
});
UserRoute.delete('/:id', authorizeRole(['admin', 'superadmin']), async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        await user.destroy();
        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    }
    catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur :", error);
        res.status(500).json({ message: "Erreur serveur lors de la suppression de l'utilisateur" });
    }
});
UserRoute.get('/username/:username', async (req, res) => {
    const username = req.params.username;
    try {
        // Rechercher l'utilisateur par username
        const user = await User.findOne({
            where: { username },
            attributes: ['username', 'email', 'bio', 'avatar', 'birthday', 'createdAt']
        });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération de l'utilisateur" });
    }
});
// Route pour récupérer les statistiques des utilisateurs
UserRoute.get('/stats', authorizeRole(['admin', 'superadmin']), async (req, res) => {
    try {
        const totalUsers = await User.count();
        const usersByRole = await User.findAll({
            attributes: ['RoleId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['RoleId'],
            include: [{ model: Role, as: 'role' }]
        });
        res.status(200).json({
            totalUsers,
            usersByRole
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération des statistiques des utilisateurs:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques des utilisateurs' });
    }
});
// Route pour récupérer les jeux d'un utilisateur
UserRoute.get('/:userId/games', authorizeRole(['admin', 'developer', 'superadmin']), async (req, res) => {
    try {
        const userId = req.params.userId;
        const games = await Game.findAll({
            where: { UserId: userId },
            include: [
                { model: Status, as: 'status' },
                { model: Language, as: 'language' }
            ]
        });
        res.status(200).json(games);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux de l\'utilisateur' });
    }
});
// Route pour récupérer les utilisateurs avec leurs rôles
UserRoute.get('/with-roles', authorizeRole(['admin', 'superadmin']), async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{ model: Role, as: 'role' }]
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs avec leurs rôles:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs avec leurs rôles' });
    }
});
// Route pour récupérer les utilisateurs par rôle
UserRoute.get('/by-role/:roleId', authorizeRole(['admin', 'superadmin']), async (req, res) => {
    try {
        const roleId = req.params.roleId;
        const users = await User.findAll({
            where: { RoleId: roleId },
            include: [{ model: Role, as: 'role' }]
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs par rôle:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs par rôle' });
    }
});
// Route pour récupérer les développeurs
UserRoute.get('/developers', async (req, res) => {
    try {
        const developerRole = await Role.findOne({ where: { name: 'developer' } });
        if (!developerRole) {
            return res.status(404).json({ error: 'Rôle développeur non trouvé' });
        }
        const developers = await User.findAll({
            where: { RoleId: developerRole.dataValues.id },
            include: [{ model: Role, as: 'role' }]
        });
        res.status(200).json(developers);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des développeurs:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des développeurs' });
    }
});
// Route pour récupérer les administrateurs
UserRoute.get('/admins', authorizeRole(['admin', 'superadmin']), async (req, res) => {
    try {
        const adminRole = await Role.findOne({ where: { name: 'admin' } });
        if (!adminRole) {
            return res.status(404).json({ error: 'Rôle administrateur non trouvé' });
        }
        const admins = await User.findAll({
            where: { RoleId: adminRole.dataValues.id },
            include: [{ model: Role, as: 'role' }]
        });
        res.status(200).json(admins);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des administrateurs:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des administrateurs' });
    }
});
// Route pour récupérer les superadministrateurs
UserRoute.get('/superadmins', authorizeRole(['superadmin']), async (req, res) => {
    try {
        const superadminRole = await Role.findOne({ where: { name: 'superadmin' } });
        if (!superadminRole) {
            return res.status(404).json({ error: 'Rôle superadministrateur non trouvé' });
        }
        const superadmins = await User.findAll({
            where: { RoleId: superadminRole.dataValues.id },
            include: [{ model: Role, as: 'role' }]
        });
        res.status(200).json(superadmins);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des superadministrateurs:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des superadministrateurs' });
    }
});
// Route pour récupérer l'ID du développeur connecté
UserRoute.get('/current-developer-id', authorizeRole(['developer']), async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token non fourni' });
        }
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.userId;
        // Vérifier que l'utilisateur est bien un développeur
        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: 'role' }]
        });
        if (!user || user.dataValues.role.name !== 'developer') {
            return res.status(403).json({ error: 'L\'utilisateur n\'est pas un développeur' });
        }
        res.status(200).json(userId);
    }
    catch (error) {
        console.error('Erreur lors de la récupération de l\'ID du développeur:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'ID du développeur' });
    }
});
UserRoute.get('/library/allgames', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        console.log('Token décodé:', req.user);
        console.log('Récupération des jeux pour userId:', userId);
        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }
        const userWithGames = await sequelize.models.User.findByPk(userId, {
            include: [
                {
                    model: sequelize.models.Game,
                    as: 'libraryGames',
                    through: { attributes: [] }, // Cache la table Library dans le résultat
                    include: [
                        { model: Status, as: 'status' },
                        { model: Language, as: 'language' },
                        { model: Controller, as: 'controllers' },
                        { model: Platform, as: 'platforms' },
                        { model: Genre, as: 'genres' },
                        { model: Tag, as: 'tags' },
                        { model: User, as: 'gameOwner' }
                    ]
                }
            ]
        });
        if (!userWithGames) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        const games = userWithGames.get('libraryGames');
        if (!games || games.length === 0) {
            return res.status(404).json({ message: 'Aucun jeu trouvé dans votre bibliothèque' });
        }
        res.status(200).json(games);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
    }
});
// Route pour ajouter un jeu à la bibliothèque
UserRoute.post('/library/games/:gameId', verifyToken, async (req, res) => {
    try {
        // Récupérer l'ID utilisateur du token (peut être dans userId ou id)
        const userId = req.user?.userId || req.user?.id;
        const gameId = req.params.gameId;
        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }
        // Vérifier si le jeu existe
        const game = await Game.findByPk(gameId);
        if (!game) {
            return res.status(404).json({ error: 'Jeu non trouvé' });
        }
        // Vérifier si le jeu est déjà dans la bibliothèque
        const existingLibrary = await sequelize.models.Library.findOne({
            where: {
                UserId: userId,
                GameId: gameId
            }
        });
        if (existingLibrary) {
            return res.status(400).json({ error: 'Ce jeu est déjà dans votre bibliothèque' });
        }
        // Ajouter le jeu à la bibliothèque
        await sequelize.models.Library.create({
            UserId: userId,
            GameId: gameId,
            addedAt: new Date()
        });
        res.status(201).json({ message: 'Jeu ajouté à votre bibliothèque avec succès' });
    }
    catch (error) {
        console.error('Erreur lors de l\'ajout du jeu à la bibliothèque:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout du jeu à la bibliothèque' });
    }
});
// Route pour supprimer un jeu de la bibliothèque
UserRoute.delete('/library/games/:gameId', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const gameId = req.params.gameId;
        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }
        // Vérifier si le jeu est dans la bibliothèque
        const libraryEntry = await sequelize.models.Library.findOne({
            where: {
                UserId: userId,
                GameId: gameId
            }
        });
        if (!libraryEntry) {
            return res.status(404).json({ error: 'Ce jeu n\'est pas dans votre bibliothèque' });
        }
        // Supprimer le jeu de la bibliothèque
        await libraryEntry.destroy();
        res.status(200).json({ message: 'Jeu retiré de votre bibliothèque avec succès' });
    }
    catch (error) {
        console.error('Erreur lors de la suppression du jeu de la bibliothèque:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du jeu de la bibliothèque' });
    }
});
// Route pour vérifier si un jeu est dans la bibliothèque
UserRoute.get('/library/games/:gameId/check', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const gameId = req.params.gameId;
        if (!userId) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }
        const isInLibrary = await sequelize.models.Library.findOne({
            where: {
                UserId: userId,
                GameId: gameId
            }
        });
        res.status(200).json(!!isInLibrary);
    }
    catch (error) {
        console.error('Erreur lors de la vérification du jeu dans la bibliothèque:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification du jeu dans la bibliothèque' });
    }
});
