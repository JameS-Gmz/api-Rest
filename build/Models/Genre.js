import { STRING, TEXT } from "sequelize";
import { sequelize } from "../database.js";
import { Game } from "./Game.js";
export const Genre = sequelize.define("Genre", {
    name: {
        type: STRING(100),
        validate: {
            notNull: false
        }
    },
    description: TEXT('tiny')
});
Game.belongsToMany(Genre, { through: "GameGenre" });
Genre.belongsToMany(Game, { through: "GameGenre" });
