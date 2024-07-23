import { STRING } from "sequelize";
import { sequelize } from "../database.js";
import { Game } from "./Game.js";

export const Image = sequelize.define("Image", {

    url : {
        type : STRING,
        validate : {
            isUrl : true
        }
    } 
});

Image.hasOne(Game);
Game.hasMany(Image);