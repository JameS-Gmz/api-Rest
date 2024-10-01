import { sequelize } from "../database.js";
import { DataTypes, where } from "sequelize";
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
        type: DataTypes.STRING(50),  // Ne pas utiliser TEXT ici
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
            model: 'Roles',  // Le modèle Role
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
        const hashedPassword = await bcrypt.hash(password, 12);  // 12 rounds pour la sécurité

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
            RoleId: role.dataValues.id  // Assigner le rôle trouvé
        });

        // Récupérer le nouvel utilisateur avec son rôle
        const userWithRole = await User.findByPk(newUser.dataValues.id, {
            include: [{ model: Role, as: 'role' }]  // Inclure le rôle de l'utilisateur
        });

        if (!userWithRole || !userWithRole.dataValues.role) {
            return res.status(500).json({ error: 'Erreur lors de la récupération du rôle de l\'utilisateur' });
        }

        // Générer le token après la création de l'utilisateur
        const token = jwt.sign(
            {
                username: userWithRole.dataValues.username,
                userId: userWithRole.dataValues.id,
                email: userWithRole.dataValues.email,
                role: userWithRole.dataValues.role.name,  // Inclure le rôle dans le token
                bio: userWithRole.dataValues.bio
            },
            secretKey,
            { expiresIn: '1h' }
        );

        // Envoyer la réponse avec le token
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token: token
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


UserRoute.post('/signin', async (req, res) => {
    const { email, password } = req.body;


    try {
        const user = await User.findOne({ where: { email }, include: [{ model: Role, as: 'role' }]  });
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
                role: user.dataValues.role ? user.dataValues.role.name : 'user',
                bio : user.dataValues.bio
            },
            secretKey,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Connexion réussie',
            token,
            userId: user.dataValues.id,
            username: user.dataValues.username,
            role : user.dataValues.role?.name,
            bio : user.dataValues.bio
        });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur serveur' });
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
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération de l'utilisateur" });
    }
});

UserRoute.put('/profile/:id', authorizeRole(['user']),async (req, res) => {
    const userId = req.params.id;
    const { username, email, bio, avatar, birthday } = req.body;  // Récupère les nouvelles données

    try {
        // Rechercher l'utilisateur
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Mise à jour de l'utilisateur
        const updatedUser = await user.update({
            username,
            email,
            bio,
            avatar,
            birthday,
        });

        res.status(200).json({
            message: 'Profil mis à jour avec succès',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil :', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }
});

UserRoute.post('/assign-developer/:userId', async (req, res) => {
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
      user.RoleId = developerRole.dataValues.id;
      await user.save();
  
      // Recharger les relations de l'utilisateur, y compris le rôle
      await user.reload({ include: [{ model: Role, as: 'role' }] });
  
      // Générer un nouveau token JWT avec le rôle mis à jour
      const token = jwt.sign(
        {
          username: user.dataValues.username,
          userId: user.dataValues.id,
          email: user.dataValues.email,
          role: user.dataValues.role ? user.dataValues.role.name : 'user'  // Rôle mis à jour
        },
        secretKey,
        { expiresIn: '1h' }
      );
  
      res.status(200).json({
        message: 'Rôle "developer" attribué avec succès et token régénéré',
        token,  // Envoyer le nouveau token
        userId: user.dataValues.id,
        username: user.dataValues.username,
        role: user.dataValues.role ? user.dataValues.role.name : 'user'
      });
    } catch (error) {
      console.error('Erreur lors de l\'attribution du rôle :', error);
      res.status(500).json({ message: 'Erreur lors de l\'attribution du rôle' });
    }
  });


