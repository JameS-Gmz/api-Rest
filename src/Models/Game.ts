import { sequelize } from "../database.js";
import { DataTypes, DECIMAL, DOUBLE, Op, Sequelize, STRING } from "sequelize";
import { Router } from 'express';
import { Controller } from "./Controller.js";
import { Platform } from "./Platform.js";
import { Status } from "./Status.js";
import { Language } from "./Language.js";


export const GameRoute = Router();
export const Game = sequelize.define("Game", {
    title: {
        type: STRING(100),
        allowNull: true,
    },
    price: {
        type: DOUBLE,
        allowNull: true,
        validate: {
            max: 100,
            min: 0,
        }
    },
    authorStudio: {
        type: STRING,
        allowNull: true,
    },
    madewith: {
        type: STRING,
        allowNull: true,
    },
    description: {
        type: STRING(1500),
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'createdAt',
        allowNull: true,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updatedAt',
        allowNull: true,
    },
    StatusId: {
        type: DataTypes.INTEGER,
        allowNull: true,  // Autoriser NULL pour éviter l'erreur
        references: {
            model: 'Statuses',
            key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    },
    LanguageId: {
        type: DataTypes.INTEGER,
        allowNull: true,  // Autoriser NULL pour éviter l'erreur
        references: {
            model: 'Languages',
            key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    }
});


// route pour créer un jeu

GameRoute.post('/new', async (req, res) => {
    const { title, description, price, authorStudio, madewith,StatusId } = req.body;

    try {
        const game = await Game.create({ title, description, price, authorStudio, madewith, StatusId });

        res.status(201).json(game);
    } catch (error) {
        console.error('Erreur lors de la création du jeu :', error);
        res.status(500).json({ error: 'Erreur lors de la création du jeu' });
    }
});

GameRoute.post('/new/manyGames', async (req, res) => {
    try {
        // Assurez-vous que req.body est un tableau d'objets de jeux
        const newGames = req.body;

        // Validation simple pour s'assurer que c'est un tableau
        if (!Array.isArray(newGames)) {
            return res.status(400).json({ error: 'Le corps de la requête doit être un tableau d\'objets de jeux' });
        }

        // Utiliser bulkCreate pour insérer plusieurs jeux
        const createdGames = await Game.bulkCreate(newGames);

        // Répondre avec un message de succès
        res.status(201).json({
            message: 'Jeux créés avec succès !',
            games: createdGames // Optionnel: Inclure les jeux créés dans la réponse
        });
    } catch (error) {
        console.error('Erreur lors de l\'insertion des jeux :', error);
        res.status(500).json({ error: 'Erreur lors de l\'insertion des jeux' });
    }
});

GameRoute.get("/AllGames", async (req, res) => {
    try {
        const games = await Game.findAll()
        res.status(200).json(games);
    } catch (error) {
        console.log(error);
    }
});

// //route qui recupere un game avec soit l'id soit le title

// GameRoute.get("/:identifier", async (req, res) => {
//     try {
//         const identifier = req.params.identifier

//         const game = await Game.findOne({
//             where: {
//                 [Op.or]: [{ title: identifier }, { id: identifier }],
//             }
//         })
//         res.status(200).json(game);
//     } catch (error) {
//         console.log(error);
//     }
// });

//route qui recupere un produit uniquement avec son ID

GameRoute.get("/id/:id", async (req, res) => {
    try {
        const game_id = req.params.id
        const game = await Game.findByPk(game_id)

        res.status(200).json(game);
    } catch (error) {
        console.log(error);
    }
});

//route qui recupere des produits selon une intervalle de pris definis par l'utilisateur
GameRoute.get("/price/:min/:max", async (req, res) => {
    try {
        const min = req.params.min;
        const max = req.params.max;

        const games = await Game.findAll({
            where: {
                price: {
                    [Op.between]: [min, max]
                }
            }
        })
        res.status(200).json(games);
    } catch (error) {
        console.log(error);
    }
});

GameRoute.get("/sequence/date", async (req, res) => {
    try {
        const gamesDate = await Game.findAll({
            order: [['createdAt', 'DESC']], // Trier par 'createdAt' en ordre décroissant
        });
        res.status(200).json(gamesDate);
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des jeux' });
    }
});

GameRoute.get('/search', async (req, res) => {
    const query = req.query.q; // Exemple: /search?q=nomdujeu


    if (!query) {
        return res.status(400).json({ error: 'Requête invalide, le paramètre de recherche est manquant.' });
    }

    try {
        console.log('Recherche effectuée avec le terme :', query);

        // Rechercher des jeux dans la base de données
        const games = await Game.findAll({
            where: {
                title: {
                    [Op.like]: `%${query}%` // Recherche partielle
                }
            }
        });

        console.log('Jeux trouvés:', games); // Log les jeux trouvés

        if (games.length === 0) {
            return res.status(404).json({ error: 'Aucun jeu trouvé.' });
        }

        res.status(200).json(games); // Retourne les jeux trouvés
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des jeux.' });
    }
});
//route qui supprime un jeu selon son id
GameRoute.delete("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const nbDeletedGames = await Game.destroy({
            where: {

                id: isNaN(Number(id)) ? 0 : id,//operateur ternaire => const r == conditions? valretour1 : valretour2
            }
        });

        if (nbDeletedGames == 0) {
            res.status(404).json("Aucun produit trouvé");
        } else {
            res.status(200).json("Tous les produits contenant le mot ou l'id suivant ont été supprimés : " + id);
        }

    } catch (error) {
        console.log(error);
    }
});


GameRoute.post('/associate-categories', async (req, res) => {
    const { GameId, ControllerId, PlatformId, StatusId, LanguageId } = req.body;

    // Convertir en tableau d'IDs si nécessaire
    const controllerIds = Array.isArray(ControllerId) ? ControllerId.map(id => parseInt(id, 10)) : [parseInt(ControllerId, 10)];
    const platformIds = Array.isArray(PlatformId) ? PlatformId.map(id => parseInt(id, 10)) : [parseInt(PlatformId, 10)];

    try {
        // Vérifier que le jeu existe
        const game = await Game.findByPk(GameId);
        if (!game) {
            return res.status(404).json({ error: 'Jeu non trouvé' });
        }

        // Vérifier que le statut existe
        const status = await Status.findByPk(StatusId);
        if (!status) {
            return res.status(404).json({ error: 'Statut non trouvé' });
        }

        // Mettre à jour le jeu avec le statut
        game.setDataValue = StatusId;
        console.log(StatusId)
        await game.save();

        
        const language = await Language.findByPk(LanguageId);
    
            if (!language) {
              return res.status(404).json({ error: 'Langue non trouvée' });
            }
            game.setDataValue = LanguageId;
            console.log(LanguageId)
            await game.save();
        

        // Rechercher et associer les contrôleurs
        const controllers = await Controller.findAll({ where: { id: controllerIds } });
        if (!controllers.length) {
            return res.status(400).json({ error: 'Aucun contrôleur trouvé pour les IDs spécifiés' });
        }
        await sequelize.models.GameControllers.create({
            GameId : GameId,
            ControllerId : ControllerId
        });

        // Rechercher et associer les plateformes
        const platforms = await Platform.findAll({ where: { id: platformIds } });
        if (!platforms.length) {
            return res.status(400).json({ error: 'Aucune plateforme trouvée pour les IDs spécifiés' });
        }
        await sequelize.models.GamePlatforms.create({
            GameId : GameId,
            PlatformId : PlatformId
        });

        res.status(200).json({ message: 'Jeu mis à jour avec succès avec les contrôleurs, plateformes et statut.' });
    } catch (error) {
        console.error('Erreur lors de l\'association des catégories:', error);
        res.status(500).json({ error: 'Erreur lors de l\'association des catégories' });
    }
});

