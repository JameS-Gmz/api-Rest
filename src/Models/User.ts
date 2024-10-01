import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { Router } from "express";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

// Vérifiez que la clé secrète est bien définie
const secretKey = process.env.JWT_SECRET || 'defaultSecretKey';
if (!process.env.JWT_SECRET) {
    console.warn('ATTENTION : Utilisation d\'une clé secrète par défaut. Veuillez définir JWT_SECRET dans les variables d\'environnement pour la production.');
}

export const User = sequelize.define("User", {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Le nom d'utilisateur ne peut pas être vide"
            }
        }
    },
    email: {
        type: DataTypes.STRING,  // Ne pas utiliser TEXT ici
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
        type: DataTypes.TEXT,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    birthday: {
        type: DataTypes.DATE,
        allowNull: true
    }
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
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'L\'utilisateur existe déjà' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);  // 12 rounds pour augmenter la sécurité

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            birthday,
            bio: '',
            avatar: ''
        });

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            userId: newUser.dataValues.id,
            username: newUser.dataValues.username,
            email: newUser.dataValues.email
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

UserRoute.post('/signin', async (req, res) => {
    const { email, password } = req.body;


    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Adresse e-mail ou mot de passe incorrect' });
            
        }

        const isPasswordValid = await bcrypt.compare(password, user.dataValues.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect' });
        }

        const token = jwt.sign(
            {
                username: user.dataValues.username,
                userId: user.dataValues.id,
                email: user.dataValues.email,
                role: user.dataValues.role
            },
            secretKey,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Connexion réussie',
            token,
            userId: user.dataValues.id,
            username: user.dataValues.username
        });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

UserRoute.get('/:id', async (req, res) => {
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
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération de l'utilisateur" });
    }
});

UserRoute.put('/profile/:id', async (req, res) => {
    try {
        // Récupérer l'ID de l'utilisateur depuis les paramètres de l'URL
        const userId = req.params.id;

        // Vérifier que l'ID de l'utilisateur est bien fourni dans les paramètres
        if (!userId) {
            return res.status(400).json({ error: 'ID de l\'utilisateur manquant dans les paramètres' });
        }

        // Les nouvelles données du profil à mettre à jour
        const { username, email, bio, avatar } = req.body;

        // Mettre à jour l'utilisateur avec les nouvelles informations
        const [updated] = await User.update(
            {
                username,
                email,
                bio,
                avatar,
                updatedAt: new Date(),
            },
            {
                where: { id: userId }, // Mettre à jour en fonction de l'ID de l'utilisateur passé dans les paramètres
            }
        );

        // Vérifier si l'utilisateur a bien été mis à jour
        if (updated) {
            const updatedUser = await User.findOne({ where: { id: userId } });
            return res.status(200).json({
                message: 'Profil mis à jour avec succès',
                user: updatedUser
            });
        }

        // Si aucun utilisateur n'a été trouvé pour cet ID
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});

UserRoute.post('/profile/avatar', async (req, res) => {
    try {
      const userId = req;  // Utiliser le token pour récupérer l'utilisateur connecté
  
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier uploadé' });
      }
  
      // Exemple: Mettre à jour le chemin de l'avatar de l'utilisateur
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
  
      await User.update({ avatar: avatarPath }, { where: { id: userId } });
  
      res.status(200).json({ message: 'Avatar mis à jour avec succès', avatar: avatarPath });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'avatar' });
    }
  });
  
