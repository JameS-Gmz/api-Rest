import { sequelize } from "../database.js";
import { Game } from "./Game.js";
import { DataTypes, TEXT } from "sequelize";
import { Router } from "express";

export const GenreRoute = Router();
export const Genre = sequelize.define("Genre", {
    name: {
        type: DataTypes.STRING,
        validate: {
            notNull: false
        }
    },
    description: TEXT
  });
  
  GenreRoute.post('/new', async (req, res) => {
    const genres = [
      { name: 'FPS', description: 'First-Person Shooter' },
      { name: 'Survival', description: 'Survival games' },
      { name: 'Action-Adventure', description: 'Combines elements of action and adventure' },
      { name: 'Roguelike', description: 'Games with procedurally generated levels' },
      { name: 'Simulation', description: 'Games that simulate real-world activities' },
      { name: 'RTS', description: 'Real-Time Strategy games' },
      { name: 'RPG', description: 'Role-Playing Games' },
      { name: 'Rhythm', description: 'Games that involve rhythm-based gameplay' },
      { name: 'Hack and Slash', description: 'Games focused on combat and fighting' },
      { name: 'Reflection', description: 'Games that involve reflection and thought' },
      { name: 'Beat Them All', description: 'Games where players beat multiple enemies' },
      { name: 'Platformer', description: 'Games that involve jumping between platforms' },
      { name: 'TPS', description: 'Third-Person Shooter games' },
      { name: 'Combat', description: 'Games focused on combat' },
      { name: 'Battle Royale', description: 'Games where players compete to be the last one standing' },
      { name: 'MMORPG', description: 'Massively Multiplayer Online Role-Playing Games' },
      { name: 'MOBA', description: 'Multiplayer Online Battle Arena' },
      { name: 'Party Games', description: 'Games designed for group play' },
      { name: 'Puzzlers', description: 'Games that involve solving puzzles' }
    ];
    try {
      
      // Insérer les genres en utilisant bulkCreate
      await Genre.bulkCreate(genres);
      
      res.status(201).json({ message: 'Genres créés avec succès !' });
    } catch (error) {
      console.error('Erreur lors de l\'insertion des genres :', error);
      res.status(500).json({ error: 'Erreur lors de l\'insertion des genres' });
    }
    
    Game.belongsToMany(Genre, { through: "GameGenre" });
    Genre.belongsToMany(Game, { through: "GameGenre" });
  
});
