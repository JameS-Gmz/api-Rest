import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const User = sequelize.define("User", {
    username: DataTypes.STRING,
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
})


export interface UserEntity{
    username: string,
    firstname: string,
    lastname: string,
    email: string,
    password: string
}