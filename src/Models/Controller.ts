import { STRING, TEXT } from "sequelize";
import { sequelize } from "../database.js";
import { Router } from "express";
import { Game } from "./Game.js";

export const ControllerRoute = Router();
export const Controller = sequelize.define("Controller", {

    name : {
        type : STRING(100),
        validate : {
            notEmpty : true
        }
    },
    description : {
        type : TEXT('tiny'),
    } 
});


ControllerRoute.post('/new', async (req, res) => {
try {
const controllers = [{}];

 // Insérer les genres en utilisant bulkCreate
 await Controller.bulkCreate(controllers);
 res.status(201).json({ message: 'Controllers créés avec succès !' });

} catch (error) {
 console.error('Erreur lors de l\'insertion des Controllers :', error);
 res.status(500).json({ error: 'Erreur lors de l\'insertion des Controllers' });
}

});

ControllerRoute.get('/games/:controllerId', async (req, res) => {
  const { controllerId } = req.params;

  try {
      // Vérifier si le contrôleur existe
      const controller = await Controller.findByPk(controllerId);
      if (!controller) {
          return res.status(404).json({ error: 'Contrôleur non trouvé' });
      }

      // Récupérer tous les jeux associés à ce contrôleur
      const games = await Game.findAll({
          include: [{
              model: Controller,
              where: { id: controllerId }, // Filtrer par le ControllerId
              through: { attributes: [] } // Exclure les attributs de la table de jointure
          }]
      });

      if (games.length === 0) {
          return res.status(404).json({ error: 'Aucun jeu trouvé pour ce contrôleur' });
      }

      res.status(200).json(games);
  } catch (error) {
      console.error('Erreur lors de la récupération des jeux:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des jeux' });
  }
});

ControllerRoute.get('/all', async (req, res) => {
    try {
      const controllers = await Controller.findAll();
      res.json(controllers);
    } catch (error) {
      console.error('Erreur lors de la récupération des contrôleurs :', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des contrôleurs' });
    }
  });
  

