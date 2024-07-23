import { sequelize } from "../database.js";
import { Game } from "./Game.js";
export const Language = sequelize.define("Language", {

});

Game.hasOne(Language);
Language.hasMany(Game);