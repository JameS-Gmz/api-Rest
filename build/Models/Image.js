import { STRING } from "sequelize";
import { sequelize } from "../database.js";
export const Image = sequelize.define("Image", {
    url: {
        type: STRING,
        validate: {
            isUrl: true
        }
    }
});
