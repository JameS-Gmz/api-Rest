import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
export const User = sequelize.define("User", {
    username: {
        type: DataTypes.STRING(100),
        validate: {
            notNull: false
        }
    },
    name: {
        type: DataTypes.STRING(100),
        validate: {
            notNull: false
        }
    },
    email: {
        type: DataTypes.STRING(100),
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(100),
        validate: {
            min: 8,
        }
    },
    bio: DataTypes.TEXT('medium'),
    avatar: DataTypes.STRING,
});
