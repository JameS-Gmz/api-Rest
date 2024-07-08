import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
export const Game = sequelize.define("Game", {
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    body: DataTypes.STRING,
    image: DataTypes.STRING
});
