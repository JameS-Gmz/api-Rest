import { sequelize } from "../database.js";
import { DataTypes } from "sequelize";
export const Role = sequelize.define("Role", {
    name: {
        type: DataTypes.STRING(100),
        allowNull: false, // Rend ce champ obligatoire
        defaultValue: "Default Role Name", // Valeur par défaut
        validate: {
            notEmpty: true, // Valide que le champ ne soit pas une chaîne vide
        },
    },
    description: DataTypes.STRING(255)
});
