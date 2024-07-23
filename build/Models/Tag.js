import { sequelize } from "../database.js";
import { Game } from "./Game.js";
export const Tag = sequelize.define("Tag", {});
Game.belongsToMany(Tag, { through: "GameTag" });
Tag.belongsToMany(Game, { through: "GameTag" });
