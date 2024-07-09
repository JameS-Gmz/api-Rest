import { Request, Response} from 'express';
import express from "express";

const sentance : String = "Good Good"
console.log(sentance)

const app = express();
import{ Game } from "./Models/Game.js";
import { Op, Optional, or } from "sequelize"
import { User, UserEntity } from './Models/User.js';

app.use(express.json());

// Toutes les routes Post //

// route pour créer un jeu
app.post("/game", async (req: Request, res: Response) => {
    const newGame = req.body;

    const game = await Game.create({

        name: newGame.name,
        price: newGame.price,
        body: newGame.body,
        stock: newGame.stock
    })
    res.status(200).json(game);
})

// route pour créer un user
app.post("/signup", async (req: Request, res: Response) => {

    const newUser = req.body;
    const user = await User.create({
        firstname : newUser.name,
        lastname: newUser.lastname,
        username: newUser.username,
        email:newUser.email,
        password:newUser.password
    })

    res.status(200).json(user);
})


//route pour recuperer tous les jeux
app.get("/games", async (req: Request, res: Response) => {
    const games = await Game.findAll()
    res.status(200).json(games)
})

//route qui recupere un produit avec soit l'id soit le name
app.get("/game/:identifier", async (req: Request, res: Response) => {
    const identifier = req.params.identifier

    const game = await Game.findOne({
        where: {
            [Op.or]: [{ name: identifier }, { id: identifier }],
        }
    })

    res.status(200).json(game)
})

//route qui recupere un produit uniquement avec son ID
app.get("/game/id/:id", async (req: Request, res: Response) => {
    const game_id = req.params.id
    const game = await Game.findByPk(game_id)

    res.status(200).json(game)
})

//route qui recupere un produit uniquement avec son name
app.get("/game/name/:name", async (req: Request, res: Response) => {
    const game_name = req.params.name

    const game = await Game.findAll({
        where: {
            name: game_name
        }
    })
    res.status(200).json(game)
})

//route qui recupere des produits avec un stock minimum
app.get("/games/stock/:min", async (req: Request, res: Response) => {
    const min = req.params.min

    const games = await Game.findAll({
        where: {
            stock: {
                [Op.gte]: min
            }
        }
    })
    res.status(200).json(games)
})

//route qui recupere des produits selon une intervalle de pris definis par l'utilisateur

app.get("/games/price/:min/:max", async (req: Request, res: Response) => {
    const min = req.params.min;
    const max = req.params.max;

    const games = await Game.findAll({
        where: {
            price: {
                [Op.between]: [min, max]
            }
        }
    })
    res.status(200).json(games)
})

app.delete("/games/:text", async (req: Request, res: Response) => {
    const text = req.params.text;


    const nbDeletedGames = await Game.destroy({
        where: {

            [Op.or]: [
                { id: isNaN(Number(text)) ? 0 : text },//operateur ternaire => const r == conditions? valretour1 : valretour2
                { name: text }
            ]
        }
    });

    if (nbDeletedGames == 0) {
        res.status(404).json("Aucun produit trouvé")
    } else {
        res.status(200).json("Tous les produits contenant le mot ou l'id suivant ont été supprimés : " + text);
    }
});

//route qui supprime un produit selon son name
app.delete("/game/delete/:name", async (req: Request, res: Response) => {
    const gamename = req.params.name;
    const deletegame = await Game.destroy({
        where: {
            name: gamename
        }
    })
    res.status(200).json("le produit suivant est supprimer : " + deletegame)
})

app.get("/game/stock/:id", async (req: Request, res: Response) => {
    const id = req.params.id
})

app.listen(9090, () => {
    console.log("Server on port 9090")
})