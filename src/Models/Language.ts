import { sequelize } from "../database.js";
import { DOUBLE, STRING } from "sequelize";
import { Game } from "./Game.js";

export const Language = sequelize.define("Language", {
    name: {
        type: STRING(100),
        allowNull: false,
    },
    code: {
        type: DOUBLE,
        allowNull: false,
        validate: {
            max: 100,
            min: 0,
        }
    }
});

Game.hasOne(Language);
Language.hasMany(Game);