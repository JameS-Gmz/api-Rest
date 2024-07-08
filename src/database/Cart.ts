import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const Cart = sequelize.define("Category", {
    id: DataTypes.INTEGER,
})