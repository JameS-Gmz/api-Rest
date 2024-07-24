import { DECIMAL, NUMBER, Op, STRING } from "sequelize";
import { sequelize } from "../database.js";
import { User } from "./User.js";

export const Game = sequelize.define("Game", {
    title: {
        type: STRING(100),
        validate: {
            notNull: false
        }
    },
    price: {
        type: DECIMAL,
        validate: {
            max: 50,

        }
    },
    creator: {
        type: STRING,
        validate: {
            notNull: false
        }
    },
    rating: {
        type: DECIMAL,
        validate: {
            max: 10,
            min: 0
        }
    },
    description: STRING(255)
});

// Relation behind Game and other and creation of all join queries//


Game.belongsToMany(User, { through: "Comment" });
User.belongsToMany(Game, { through: "Comment" });

Game.belongsToMany(User, { through: "Library" });
User.belongsToMany(Game, { through: "Library" });

Game.belongsToMany(User, { through: "Upload" });
User.belongsToMany(Game, { through: "Upload" });

User.belongsToMany(Game, { through: "Order" });
Game.belongsToMany(User, { through: "Order" });


import { Router } from 'express';
export const GameRoute = Router();

// route pour créer un jeu

GameRoute.post('/new', async (req, res) => {
  try {
    const newGame = req.body;
    const game = await Game.create({

        title: newGame.title,
        price: newGame.price,
        creator: newGame.creator,
        rating: newGame.rating,
        description: newGame.description

    }).catch((error: Error) => console.log(error))
    res.json(game);
  } catch (error) {
    console.log(error);
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

//route qui recupere un game avec soit l'id soit le title
GameRoute.get("/:identifier", async (req, res) => {
    try {
        const identifier = req.params.identifier

    const game = await Game.findOne({
        where: {
            [Op.or]: [{ title: identifier }, { id: identifier }],
        }
    })
    res.status(200).json(game);
    } catch (error) {
        console.log(error);
    }
});

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

//route qui recupere un produit uniquement avec son name
GameRoute.get("/title/:title", async (req, res) => {
    try {
        const game_title = req.params.title
    
        const game = await Game.findAll({
            where: {
                name: game_title
            }
        })
        res.status(200).json(game);
    } catch (error) {
        console.log(error);
    }
});

//route qui recupere des produits avec un stock minimum
GameRoute.get("/rating/:min", async (req, res) => {
    try {
        const min = req.params.min
    
        const games = await Game.findAll({
            where: {
                rating: {
                    [Op.gte]: min
                }
            }
        })
        res.status(200).json(games);
        
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
})
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

//route qui supprime un jeu selon son titre
GameRoute.delete("/game/delete/:title", async (req, res) => {
    try {
        const gamename = req.params.title;
    const deletegame = await Game.destroy({
        where: {
            title: gamename
        }
    })
    res.status(200).json("le produit suivant est supprimer : " + deletegame)
    } catch (error) {
        console.log(error)
    }
});