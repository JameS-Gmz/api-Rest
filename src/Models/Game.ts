import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";
import { User } from "./User.js";

export const Game = sequelize.define("Game", {
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    body: DataTypes.STRING,
    image: DataTypes.STRING
});

// Relation behind Game and other and creation of all join queries//


Game.belongsToMany(User,{through:"Comment"});
User.belongsToMany(Game,{through:"Comment"});

Game.belongsToMany(User,{through:"Library"});
User.belongsToMany(Game,{through:"Library"});

Game.belongsToMany(User,{through:"Upload"});
User.belongsToMany(Game,{through:"Upload"});

User.belongsToMany(Game,{through:"Order"});
Game.belongsToMany(User,{through:"Order"});

