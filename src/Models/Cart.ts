import { INTEGER } from "sequelize";
import { sequelize } from "../database.js";
import { Game } from "./Game.js";
import { User } from "./User.js";
export const Cart = sequelize.define("Cart", {
    quantity : {
        type : INTEGER,
        validate : {
            notNull : true
        }
    } 
});

Cart.belongsToMany(Game,{through:"GameCart"});
Game.belongsToMany(Cart,{through:"GameCart"});

User.hasOne(Cart);
Cart.belongsTo(User);