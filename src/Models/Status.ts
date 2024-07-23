import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { Game } from "./Game.js";

export const Status = sequelize.define("Status", {

});


Status.hasMany(Game);
Game.hasOne(Status);

