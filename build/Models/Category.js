import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { Game } from "./Game.js";
export const Category = sequelize.define("Category", {
    name: DataTypes.STRING,
});
Game.belongsToMany(Category, { through: "CategoryGame" });
Category.belongsToMany(Game, { through: "CategoryGame" });
