import { STRING } from "sequelize";
import { sequelize } from "../database.js";
import { User } from "./User.js";
export const Role = sequelize.define("Role", {
    name: {
        type: STRING(100),
        validate: {
            notNull: false
        }
    },
    description: STRING(255)
});
User.hasOne(Role);
Role.hasMany(User);
