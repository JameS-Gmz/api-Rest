import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { Game } from "./Game.js";

export const Controller = sequelize.define("Controller", {
   
});

Game.belongsToMany(Controller,{through:"GameController"});
Controller.belongsToMany(Game,{through:"GameController"});