import { sequelize } from "../database.js";
import { DataTypes, DOUBLE, Op, STRING } from "sequelize";
import { User } from "./User.js";
import { Router } from 'express';
export const GameRoute = Router();
export const Game = sequelize.define("Game", {
    title: {
        type: STRING(100),
        allowNull: false,
    },
    price: {
        type: DOUBLE,
        allowNull: false,
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
    }
});
Game.belongsToMany(User, { through: "Comment" });
User.belongsToMany(Game, { through: "Comment" });
Game.belongsToMany(User, { through: "Library" });
User.belongsToMany(Game, { through: "Library" });
Game.belongsToMany(User, { through: "Upload" });
User.belongsToMany(Game, { through: "Upload" });
User.belongsToMany(Game, { through: "Order" });
Game.belongsToMany(User, { through: "Order" });
// route pour créer un jeu
GameRoute.post('/new', async (req, res) => {
    try {
        const newGame = req.body;
        const game = await Game.create({
            title: newGame.title,
            price: newGame.price,
            authorStudio: newGame.authorStudio,
            madewith: newGame.madewith,
            description: newGame.description,
            createdAt: newGame.createdAt,
            updatedAt: newGame.updatedAt
        });
        console.log('Jeu créé:', game);
        res.status(201).json(game); // 201 status for created resource
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create the game' });
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
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion des jeux :', error);
        res.status(500).json({ error: 'Erreur lors de l\'insertion des jeux' });
    }
});
GameRoute.get("/AllGames", async (req, res) => {
    try {
        const games = await Game.findAll();
        res.status(200).json(games);
    }
    catch (error) {
        console.log(error);
    }
});
//route qui recupere un game avec soit l'id soit le title
GameRoute.get("/:identifier", async (req, res) => {
    try {
        const identifier = req.params.identifier;
        const game = await Game.findOne({
            where: {
                [Op.or]: [{ title: identifier }, { id: identifier }],
            }
        });
        res.status(200).json(game);
    }
    catch (error) {
        console.log(error);
    }
});
//route qui recupere un produit uniquement avec son ID
GameRoute.get("/id/:id", async (req, res) => {
    try {
        const game_id = req.params.id;
        const game = await Game.findByPk(game_id);
        res.status(200).json(game);
    }
    catch (error) {
        console.log(error);
    }
});
//route qui recupere un produit uniquement avec son name
GameRoute.get("/title/:title", async (req, res) => {
    try {
        const game_title = req.params.title;
        const game = await Game.findAll({
            where: {
                name: game_title
            }
        });
        res.status(200).json(game);
    }
    catch (error) {
        console.log(error);
    }
});
//route qui recupere des produits avec un stock minimum
GameRoute.get("/rating/:min", async (req, res) => {
    try {
        const min = req.params.min;
        const games = await Game.findAll({
            where: {
                rating: {
                    [Op.gte]: min
                }
            }
        });
        res.status(200).json(games);
    }
    catch (error) {
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
        });
        res.status(200).json(games);
    }
    catch (error) {
        console.log(error);
    }
});
GameRoute.get("/order/date", async (req, res) => {
    try {
        const gamesDate = await Game.findAll({
            order: [['createdAt', 'DESC']], // Trier par 'createdAt' en ordre décroissant
        });
        console.log('Jeux récupérés :', gamesDate); // Log pour voir ce qui est récupéré
        res.status(200).json(gamesDate);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des jeux' });
    }
});
//route qui supprime un jeu selon son id
GameRoute.delete("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const nbDeletedGames = await Game.destroy({
            where: {
                id: isNaN(Number(id)) ? 0 : id, //operateur ternaire => const r == conditions? valretour1 : valretour2
            }
        });
        if (nbDeletedGames == 0) {
            res.status(404).json("Aucun produit trouvé");
        }
        else {
            res.status(200).json("Tous les produits contenant le mot ou l'id suivant ont été supprimés : " + id);
        }
    }
    catch (error) {
        console.log(error);
    }
});
//route qui supprime un jeu selon son titre
GameRoute.delete("/game/delete/:title", async (req, res) => {
    try {
        const gamename = req.params.title;
        const deletegame = await Game.destroy({
            where: {
                title: gamename
            }
        });
        res.status(200).json("le produit suivant est supprimer : " + deletegame);
    }
    catch (error) {
        console.log(error);
    }
});
