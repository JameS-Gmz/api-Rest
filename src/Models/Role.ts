import { sequelize } from "../database.js";
import { DataTypes } from "sequelize";


export const Role = sequelize.define("Role", {

    name : {
        type : DataTypes.STRING(100),
        validate : {
            notNull : false
        }
    },
    description : DataTypes.STRING(255)
});

