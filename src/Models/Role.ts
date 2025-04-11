import { sequelize } from "../database.js";
import { DataTypes } from "sequelize";


export const Role = sequelize.define("Role", {

    name: {
        type: DataTypes.STRING(100),
        allowNull: false,  // Rend ce champ obligatoire
        defaultValue: "Default Role Name",  // Valeur par défaut
        validate: {
            notEmpty: true,  // Valide que le champ ne soit pas une chaîne vide
        },
    },
    description: DataTypes.STRING(255)
});

import { Router } from "express";

export const RoleRoute = Router();

RoleRoute.get('/all', async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.status(200).json(roles);
    } catch (error) {
        console.error("Erreur lors de la récupération des rôles :", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des rôles" });
    }
});

