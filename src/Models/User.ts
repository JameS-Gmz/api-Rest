import { STRING, TEXT } from "sequelize";
import { sequelize } from "../database.js";


export const User = sequelize.define("User", {
    username : {
        type : STRING(100),
        validate : {
            notNull : false
        }
    },
    name : {
        type : STRING(100),
        validate : {
            notNull : false
        }
    },
    email : {
        type : STRING(100),
        validate : {
            isEmail : true
        }
    },
    password : {
        type : STRING(100),
        validate : {
            min : 8,
        }
    },
    bio : TEXT('medium'),
    avatar : STRING,
});
