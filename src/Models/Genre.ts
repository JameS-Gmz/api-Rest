import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { Game } from "./Game.js";

export const Genre = sequelize.define("Genre", {
   
});


Game.belongsToMany(Genre,{through:"GameGenre"});
Genre.belongsToMany(Game,{through:"GameGenre"});