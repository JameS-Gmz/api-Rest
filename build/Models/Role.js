import { sequelize } from "../database.js";
import { DataTypes } from "sequelize";
import { User } from "./User.js";
export const Role = sequelize.define("Role", {
    name: {
        type: DataTypes.STRING(100),
        validate: {
            notNull: false
        }
    },
    description: DataTypes.STRING(255)
});
User.hasOne(Role);
Role.hasMany(User);
