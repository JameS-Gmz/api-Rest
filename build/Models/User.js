import { sequelize } from "../database.js";
import { DataTypes } from "sequelize";
import { Router } from "express";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { Role } from "./Role.js";
import { authorizeRole, secretKey } from "../middleware/authRole.js";
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
UserRoute.post('/assign-developer/:userId', authorizeRole(['admin', 'superadmin']), async (req, res) => {
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
UserRoute.post('/assign-superadmin/:userId', authorizeRole(['superadmin']), async (req, res) => {
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
