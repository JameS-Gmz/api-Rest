import { INTEGER } from "sequelize";
import { sequelize } from "../database.js";
export const Cart = sequelize.define("Cart", {
    quantity: {
        type: INTEGER,
        validate: {
            notNull: false
        }
    }
});
