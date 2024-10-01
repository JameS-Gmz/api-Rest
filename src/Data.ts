
import { Router } from "express";
import { sequelize } from "./database.js";
import { QueryTypes } from "sequelize";

export const DataRoute = Router();

// Route générique pour récupérer les données de n'importe quelle table
const allowedTables = ['Controllers', 'Statuses', 'Platforms','Languages'];

DataRoute.get('/:tableName', async (req, res) => {
  const tableName = req.params.tableName;

  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ error: 'Table non autorisée' });
  }

  try {
    const data = await sequelize.query(`SELECT * FROM ${tableName}`, {
      type: QueryTypes.SELECT
    });

    res.json(data);
  } catch (error) {
    console.error(`Erreur lors de la récupération des données de la table ${tableName}`, error);
    res.status(500).json({ error: `Erreur lors de la récupération des données de la table ${tableName}` });
  }
});

