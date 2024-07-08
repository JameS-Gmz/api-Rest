import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const Roles = sequelize.define("Category", {
    id : DataTypes.INTEGER,
})