import { Controller } from "../Models/Controller.js";
import { Genre } from "../Models/Genre.js";
import { Language } from "../Models/Language.js";
import { Platform } from "../Models/Platform.js";
import { Role } from "../Models/Role.js";
import { Status } from "../Models/Status.js";
import { Tag } from "../Models/Tag.js";
// init Roles
export const initRoles = async () => {
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
        console.log('Les rôles par défaut ont été créés.');
    }
    catch (error) {
        console.error('Erreur lors de la création des rôles par défaut :', error);
    }
};
export const initCategories = async () => {
    initGenres();
    initTags();
    initPlatforms();
    initLanguages();
    initControllers();
    initStatus();
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion des catégories de jeux :', error);
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
    }
    catch (error) {
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
    }
    catch (error) {
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
        console.log("Les langues ont été insérées avec succès.");
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion des langues :', error);
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
        console.log("Les langues ont été insérées avec succès.");
    }
    catch (error) {
        console.error('Erreur lors de l\'insertion des langues :', error);
    }
};
