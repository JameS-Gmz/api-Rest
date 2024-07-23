import { Sequelize, DataTypes, Model } from "sequelize";
import { Game } from "./Models/Game.js";
// define tables

const login = {

    database: "PlayForge",
    username: "playAdmin",
    password: "playAdmin"

};

export const sequelize = new Sequelize(login.database, login.username, login.password, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false //enleve les log de sequelize
});

sequelize.authenticate()
    .then(() => console.log("Connecté à la BDD : PlayForge"))
    .catch((error: Error) => console.log(error));


sequelize.sync({ force: true })
.then(() => {
    const Game = require("./Game.ts")
    const game = new Game()
    console.log("Les modéles et les tables sont synchronisés")
    console.log(game)
})
.catch((error: Error) => (error));


    