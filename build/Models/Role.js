import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { User } from "./User.js";
export const Role = sequelize.define("Role", {
    id: DataTypes.INTEGER,
});
User.hasOne(Role);
Role.hasMany(User);
