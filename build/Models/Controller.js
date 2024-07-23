import { STRING, TEXT } from "sequelize";
import { sequelize } from "../database.js";
import { Game } from "./Game.js";
export const Controller = sequelize.define("Controller", {
    name: {
        type: STRING(100),
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: TEXT('tiny'),
    }
});
Game.belongsToMany(Controller, { through: "GameController" });
Controller.belongsToMany(Game, { through: "GameController" });
