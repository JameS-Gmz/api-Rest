import { STRING, TEXT } from "sequelize";
import { sequelize } from "../database.js";
import { Game } from "./Game.js";
export const Tag = sequelize.define("Tag", {
    name: {
        type: STRING(100),
        validate: {
            notNull: false
        }
    },
    description: TEXT('tiny')
});
Game.belongsToMany(Tag, { through: "GameTag" });
Tag.belongsToMany(Game, { through: "GameTag" });
