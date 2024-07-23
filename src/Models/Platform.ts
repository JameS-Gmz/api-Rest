import { DataTypes, INTEGER, NUMBER, STRING, TEXT } from "sequelize";
import { sequelize } from "../database.js";
import { Game } from "./Game.js";

export const Platform = sequelize.define("Plateform", {

    name : {
        type : STRING(100),
        validate : {
            notNull : false
        }
    },
    description : TEXT('tiny')
});



Game.belongsToMany(Platform,{through:"GamePlateform"});
Platform.belongsToMany(Game,{through:"GamePlateform"});