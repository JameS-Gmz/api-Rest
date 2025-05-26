import { Controller } from "../Models/Controller.js";
import { Game } from "../Models/Game.js";
import { Genre } from "../Models/Genre.js";
import { Language } from "../Models/Language.js";
import { Platform } from "../Models/Platform.js";
import { Role } from "../Models/Role.js";
import { Status } from "../Models/Status.js";
import { Tag } from "../Models/Tag.js";
import { User } from "../Models/User.js";
import bcrypt from 'bcrypt';

// init Roles

export const initRoles = async () => {
  console.log("Début de l'initialisation des rôles...");
  try {
    await Role.findOrCreate({
      where: { name: 'admin' },
      defaults: { name: 'admin' }
    });
    await Role.findOrCreate({
      where: { name: 'user' },
      defaults: { name: 'user' }
    });
    await Role.findOrCreate({
      where: { name: 'developer' },
      defaults: { name: 'developer' }
    });
    await Role.findOrCreate({
      where: { name: 'superadmin' },
      defaults: { name: 'superadmin' }
    });
    console.log('Les rôles par défaut ont été créés.');
  } catch (error) {
    console.error('Erreur lors de la création des rôles par défaut :', error);
  }
};

export const initCategories = async () => {
  console.log("Début de l'initialisation des catégories...");
  try {
    await initStatus();
    await initLanguages();
    await initGenres();
    await initTags();
    await initPlatforms();
    await initControllers();
    console.log("Initialisation des catégories terminée avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'initialisation des catégories:", error);
  }
}

// Ajout d'une fonction pour initialiser tout dans le bon ordre
export const initializeAll = async () => {
  console.log("Début de l'initialisation complète...");
  try {
    await initRoles();
    await initUsers();
    await initCategories();
    await initGames();
    console.log("Initialisation complète terminée avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'initialisation complète:", error);
  }
};

//init Genres
const genres = [
  { name: 'FPS', description: 'First-Person Shooter' },
  { name: 'Survival', description: 'Survival games' },
  { name: 'Action-Adventure', description: 'Combines elements of action and adventure' },
  { name: 'RPG', description: 'Role-Playing Game' },
  { name: 'Roguelike', description: 'Dungeon crawl with permanent death' },
  { name: 'Simulation', description: 'Real-world simulation games' },
  { name: 'RTS', description: 'Real-Time Strategy' },
  { name: 'Rhythm', description: 'Music and rhythm-based games' },
  { name: 'Hack and Slash', description: 'Combat-oriented games with melee weapons' },
  { name: 'Reflection', description: 'Puzzle-based or logic games' },
  { name: 'Beat Them All', description: 'Games focused on brawling combat' },
  { name: 'Platformer', description: 'Jumping between platforms, navigating levels' },
  { name: 'TPS', description: 'Third-Person Shooter' },
  { name: 'Combat', description: 'Hand-to-hand fighting games' },
  { name: 'Battle Royale', description: 'Last player standing in an open map' },
  { name: 'MMORPG', description: 'Massively Multiplayer Online Role-Playing Game' },
  { name: 'MOBA', description: 'Multiplayer Online Battle Arena' },
  { name: 'Party Games', description: 'Multiplayer games for parties' },
  { name: 'Puzzlers', description: 'Games based on puzzle-solving' }
];

export const initGenres = async () => {
  try {
    for (const genre of genres) {
      await Genre.findOrCreate({
        where: { name: genre.name },
        defaults: { description: genre.description }
      });
    }
    console.log("Les genres de jeux ont été insérées avec succès.");
  } catch (error) {
    console.error('Erreur lors de l\'insertion des catégories de jeux :', error);
  }
};

// init Tags
const tags = [
  { name: 'Free', description: 'Games available at no cost.' },
  { name: 'On Sale', description: 'Games currently discounted.' },
  { name: 'Five Euro or Less', description: 'Games priced at five euros or less.' },
  { name: 'Ten Euro or Less', description: 'Games priced at ten euros or less.' },
  { name: 'Local Multiplayer', description: 'Games with local co-op or competitive play.' },
  { name: 'Server Multiplayer', description: 'Games featuring online play via dedicated servers.' },
  { name: 'Network Multiplayer', description: 'Games supporting online multiplayer over a network.' }
];

export const initTags = async () => {
  try {
    for (const tag of tags) {
      await Tag.findOrCreate({
        where: { name: tag.name },
        defaults: { description: tag.description }
      });
    }
    console.log("Les tags de jeux ont été insérées avec succès.");
  } catch (error) {
    console.error('Erreur lors de l\'insertion des catégories de jeux :', error);
  }
};

const games = [
  {
    title: "Battle Quest",
    price: 19.99,
    authorStudio: "Epic Games Studio",
    madewith: "Unreal Engine 5",
    description: "An epic action-adventure game with breathtaking visuals and a compelling storyline.",
    createdAt: new Date('2024-01-15T12:00:00Z'),
    updatedAt: new Date('2024-09-15T12:00:00Z'),
    StatusId: 1,
    LanguageId: 1,
    UserId: 3,
  },
  {
    title: "Survival Island",
    price: 14.99,
    authorStudio: "Survive Studios",
    madewith: "Unity",
    description: "A survival game where you must gather resources and fight for your life on a deserted island.",
    createdAt: new Date('2023-07-10T10:00:00Z'),
    updatedAt: new Date('2023-08-12T12:00:00Z'),
    StatusId: 2,
    LanguageId: 3,
    UserId: 3,
  },
  {
    title: "Space Odyssey",
    price: 29.99,
    authorStudio: "Galaxy Interactive",
    madewith: "Godot Engine",
    description: "A space exploration game set in a massive open world with realistic physics and environments.",
    createdAt: new Date('2024-02-01T14:00:00Z'),
    updatedAt: new Date('2024-03-01T12:00:00Z'),
    StatusId: 1,
    LanguageId: 2,
    UserId: 3,
  },
  {
    title: "Fantasy Warriors",
    price: 39.99,
    authorStudio: "Dragon Lore Studios",
    madewith: "RPG Maker",
    description: "A role-playing game filled with fantasy creatures, magic, and heroic quests.",
    createdAt: new Date('2023-06-20T09:00:00Z'),
    updatedAt: new Date('2023-07-20T15:00:00Z'),
    StatusId: 3,
    LanguageId: 4,
    UserId: 3,
  },
  {
    title: "Cyber Runner",
    price: 24.99,
    authorStudio: "Neon Dreams",
    madewith: "Unity",
    description: "A fast-paced cyberpunk racing game with neon-lit streets and futuristic vehicles.",
    createdAt: new Date('2024-03-15T11:00:00Z'),
    updatedAt: new Date('2024-04-15T12:00:00Z'),
    StatusId: 1,
    LanguageId: 1,
    UserId: 3,
  },
  {
    title: "Mystic Realms",
    price: 34.99,
    authorStudio: "Enchanted Games",
    madewith: "Unreal Engine 5",
    description: "An open-world fantasy RPG with magical creatures and ancient mysteries to uncover.",
    createdAt: new Date('2023-12-01T09:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    StatusId: 2,
    LanguageId: 2,
    UserId: 3,
  },
  {
    title: "Zombie Apocalypse",
    price: 19.99,
    authorStudio: "Horror Studios",
    madewith: "Unity",
    description: "A survival horror game where you must fight hordes of zombies in a post-apocalyptic world.",
    createdAt: new Date('2023-09-20T14:00:00Z'),
    updatedAt: new Date('2023-10-20T15:00:00Z'),
    StatusId: 3,
    LanguageId: 3,
    UserId: 3,
  },
  {
    title: "Ocean Explorer",
    price: 29.99,
    authorStudio: "Marine Adventures",
    madewith: "Godot Engine",
    description: "Dive into the depths of the ocean and discover hidden treasures and mysterious sea creatures.",
    createdAt: new Date('2024-02-10T10:00:00Z'),
    updatedAt: new Date('2024-03-10T11:00:00Z'),
    StatusId: 1,
    LanguageId: 4,
    UserId: 3,
  },
  {
    title: "Racing Legends",
    price: 39.99,
    authorStudio: "Speed Masters",
    madewith: "Unreal Engine 5",
    description: "A realistic racing simulator featuring legendary cars and challenging tracks from around the world.",
    createdAt: new Date('2023-11-15T13:00:00Z'),
    updatedAt: new Date('2023-12-15T14:00:00Z'),
    StatusId: 2,
    LanguageId: 1,
    UserId: 3,
  },
  {
    title: "Puzzle Master",
    price: 14.99,
    authorStudio: "Brain Games",
    madewith: "Unity",
    description: "A collection of challenging puzzles and brain teasers to test your problem-solving skills.",
    createdAt: new Date('2024-01-05T08:00:00Z'),
    updatedAt: new Date('2024-02-05T09:00:00Z'),
    StatusId: 1,
    LanguageId: 2,
    UserId: 3 ,
  }
];

export const initGames = async () => {
  try {
    console.log("Début de l'initialisation des jeux...");
    console.log("Nombre de jeux à créer:", games.length);

    for (const game of games) {
      console.log(`Tentative de création du jeu: ${game.title}`);

      try {
        const [created] = await Game.findOrCreate({
          where: { title: game.title },
          defaults: {
            title: game.title,
            description: game.description,
            price: game.price,
            authorStudio: game.authorStudio,
            madewith: game.madewith,
            createdAt: game.createdAt,
            updatedAt: game.updatedAt,
            StatusId: game.StatusId,
            LanguageId: game.LanguageId,
            UserId: game.UserId
          }
        });

        if (created) {
          console.log(`Jeu créé avec succès: ${game.title}`);
        } else {
          console.log(`Jeu déjà existant: ${game.title}`);
        }
      } catch (error) {
        console.error(`Erreur lors de la création du jeu ${game.title}:`, error);
      }
    }

    console.log("Initialisation des jeux terminée.");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erreur détaillée lors de l\'initialisation des jeux:', error.message);
      console.error('Stack trace:', error.stack);
    } else {
      console.error('Erreur inconnue lors de l\'initialisation des jeux:', error);
    }
  }
};

//init Platforms
const platforms = [
  {
    name: "Windows",
    description: "The game is available for Windows operating systems."
  },
  {
    name: "Linux",
    description: "The game is available for Linux operating systems."
  },
  {
    name: "MacOS",
    description: "The game is available for MacOS operating systems."
  },
  {
    name: "iOS",
    description: "The game is available for iOS devices, such as iPhones and iPads."
  },
  {
    name: "Android",
    description: "The game is available for Android devices."
  },
  {
    name: "Play in Browser",
    description: "The game can be played directly in a web browser without installation."
  }
];

const initPlatforms = async () => {
  try {
    for (const platform of platforms) {
      await Platform.findOrCreate({
        where: { name: platform.name },
        defaults: { description: platform.description }
      });
    }
    console.log("Les plateformes ont été insérées avec succès.");
  } catch (error) {
    console.error('Erreur lors de l\'insertion des plateformes :', error);
  }
};

const languages = [
  {
    "name": "English",
    "description": "English is the most widely used language in the world."
  },
  {
    "name": "French",
    "description": "French is a Romance language spoken in France and many other countries."
  },
  {
    "name": "Spanish",
    "description": "Spanish is spoken by over 460 million people worldwide."
  },
  {
    "name": "German",
    "description": "German is the official language of Germany, Austria, and Switzerland."
  },
  {
    "name": "Chinese",
    "description": "Chinese, primarily Mandarin, is the most spoken language in the world."
  },
  {
    "name": "Japanese",
    "description": "Japanese is spoken by over 125 million people, primarily in Japan."
  },
  {
    "name": "Russian",
    "description": "Russian is an East Slavic language spoken by over 150 million people."
  },
  {
    "name": "Arabic",
    "description": "Arabic is the liturgical language of Islam and spoken widely in the Middle East and North Africa."
  },
  {
    "name": "Portuguese",
    "description": "Portuguese is the official language of Portugal and Brazil."
  },
  {
    "name": "Italian",
    "description": "Italian is a Romance language spoken mainly in Italy and Switzerland."
  },
  {
    "name": "Korean",
    "description": "Korean is the official language of both North and South Korea."
  },
  {
    "name": "Hindi",
    "description": "Hindi is one of the official languages of India, spoken by over 260 million people."
  },
  {
    "name": "Dutch",
    "description": "Dutch is spoken in the Netherlands and parts of Belgium."
  },
  {
    "name": "Turkish",
    "description": "Turkish is the most widely spoken of the Turkic languages, spoken in Turkey and Cyprus."
  },
  {
    "name": "Swedish",
    "description": "Swedish is spoken by over 10 million people, primarily in Sweden and Finland."
  }
];

const initLanguages = async () => {
  try {
    for (const language of languages) {
      await Language.findOrCreate({
        where: { name: language.name },
        defaults: { description: language.description }
      });
    }
    console.log("Les langues ont été insérées avec succès.");
  } catch (error) {
    console.error('Erreur lors de l\'insertion des langues :', error);
  }
};

const controllers = [
  {
    name: "Xbox",
    description: "The game is compatible with Xbox controllers."
  },
  {
    name: "Kinect",
    description: "The game supports Kinect motion sensing technology."
  },
  {
    name: "PlayStation",
    description: "The game is compatible with PlayStation controllers."
  },
  {
    name: "Wiimote",
    description: "The game supports the Wiimote motion controller from the Wii console."
  },
  {
    name: "Smartphone",
    description: "The game can be controlled via a smartphone."
  },
  {
    name: "Touchscreen",
    description: "The game is designed to be played using touchscreen controls."
  },
  {
    name: "Voice Control",
    description: "The game supports voice commands for control."
  },
  {
    name: "Joy-Con",
    description: "The game is compatible with Nintendo Switch Joy-Con controllers."
  },
  {
    name: "VR",
    description: "The game is designed for Virtual Reality (VR) headsets and controllers."
  }
];

const initControllers = async () => {
  try {
    for (const controller of controllers) {
      await Controller.findOrCreate({
        where: { name: controller.name },
        defaults: { description: controller.description }
      });
    }
    console.log("Les contrôleurs ont été insérés avec succès.");
  } catch (error) {
    console.error('Erreur lors de l\'insertion des contrôleurs :', error);
  }
};

const statuses = [
  {
    name: "In Development",
    description: "The game is currently in development, and new features are being implemented."
  },
  {
    name: "Alpha",
    description: "The game is in the Alpha stage, where core features are being tested and bugs are being fixed."
  },
  {
    name: "Beta",
    description: "The game is in the Beta stage, where it is feature-complete and undergoing final testing."
  },
  {
    name: "Demo",
    description: "A demo version of the game is available, showcasing a limited part of the full game."
  },
  {
    name: "Released",
    description: "The game has been officially released and is available to the public."
  }
];

const initStatus = async () => {
  try {
    for (const status of statuses) {
      await Status.findOrCreate({
        where: { name: status.name },
        defaults: { description: status.description }
      });
    }
    console.log("Les statuts ont été insérés avec succès.");
  } catch (error) {
    console.error('Erreur lors de l\'insertion des statuts :', error);
  }
}

const initUsers = async () => {
  console.log("Début de l'initialisation des utilisateurs...");
  try {
    // Récupération des rôles
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    const userRole = await Role.findOne({ where: { name: 'user' } });
    const developerRole = await Role.findOne({ where: { name: 'developer' } });
    const superadminRole = await Role.findOne({ where: { name: 'superadmin' } });

    if (!adminRole || !userRole || !developerRole || !superadminRole) {
      throw new Error('Un ou plusieurs rôles n\'ont pas été trouvés');
    }

    // Hachage des mots de passe
    const hashedAdminPassword = await bcrypt.hash('Admin123!', 12);
    const hashedUserPassword = await bcrypt.hash('User123!', 12);
    const hashedDevPassword = await bcrypt.hash('Developer123!', 12);
    const hashedSuperPassword = await bcrypt.hash('Superadmin123!', 12);

    // Création des utilisateurs avec les IDs de rôles corrects
    await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        email: 'admin@example.com',
        password: hashedAdminPassword,
        username: 'AdminUser',
        bio: 'I am an admin user',
        birthday: new Date('1990-01-01'),
        RoleId: adminRole.dataValues.id
      }
    });

    await User.findOrCreate({
      where: { email: 'user@example.com' },
      defaults: {
        email: 'user@example.com',
        password: hashedUserPassword,
        username: 'RegularUser',
        bio: 'I am a regular user',
        birthday: new Date('1990-01-01'),
        RoleId: userRole.dataValues.id
      }
    });

    await User.findOrCreate({
      where: { email: 'dev@example.com' },
      defaults: {
        email: 'dev@example.com',
        password: hashedDevPassword,
        username: 'GameDev',
        bio: 'I am a developer user',
        birthday: new Date('1990-01-01'),
        RoleId: developerRole.dataValues.id
      }
    });

    await User.findOrCreate({
      where: { email: 'super@example.com' },
      defaults: {
        email: 'super@example.com',
        password: hashedSuperPassword,
        username: 'SuperAdmin',
        bio: 'I am a superadmin user',
        birthday: new Date('1990-01-01'),
        RoleId: superadminRole.dataValues.id
      }
    });

    console.log('Les utilisateurs par défaut ont été créés avec leurs rôles respectifs et leurs mots de passe hachés.');
  } catch (error) {
    console.error('Erreur lors de la création des utilisateurs par défaut :', error);
  }
};


