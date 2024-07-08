import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
export const Category = sequelize.define("Category", {
    name: DataTypes.STRING,
});
