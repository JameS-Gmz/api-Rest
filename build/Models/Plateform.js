import { sequelize } from "../database.js";
import { Game } from "./Game.js";
export const Plateform = sequelize.define("Plateform", {});
Game.belongsToMany(Plateform, { through: "GamePlateform" });
Plateform.belongsToMany(Game, { through: "GamePlateform" });
