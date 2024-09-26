import cors from "cors";
import express from "express";
import { Game, GameRoute } from "./Models/Game.js";
import { User } from './Models/User.js';
import { Controller, ControllerRoute } from './Models/Controller.js';
import { Tag, TagRoute } from './Models/Tag.js';
import { Status, StatusRoute } from './Models/Status.js';
import { Platform, PlatformRoute } from './Models/Platform.js';
import { Genre, GenreRoute } from './Models/Genre.js';
import { DataRoute } from './Data.js';
import { Language, LanguageRoute } from './Models/Language.js';
import { Role } from "./Models/Role.js";
import { Cart } from "./Models/Cart.js";
const app = express();
app.use(express.json());
// error failed to fetch --> Cors head
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Ou spécifiez le domaine explicitement
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(cors({
    origin: 'http://localhost:4200', // Remplace par l'URL de ton front-end
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
    credentials: true
}));
// route pour créer un user
app.post("/register", async (req, res) => {
    const newUser = req.body;
    const user = await User.create({
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        avatar: newUser.avatar,
        bio: newUser.bio,
    }).catch((error) => console.log(error));
    res.status(200).json(user);
});
//route pour créer un Controller via l'admin
app.post("/admin/controller", async (req, res) => {
    const newController = req.body;
    const controller = await Controller.create({
        name: newController.name,
        description: newController.description
    }).catch((error) => console.log(error));
    res.status(200).json(controller);
});
//route pour créer un Tag via l'Admin
app.post("/admin/tag", async (req, res) => {
    const newTag = req.body;
    const tag = await Tag.create({
        name: newTag.name,
        description: newTag.description
    }).catch((error) => console.log(error));
    res.status(200).json(tag);
});
//route pour créer un Status via l'Admin
app.post("/admin/status", async (req, res) => {
    const newStatus = req.body;
    const status = await Status.create({
        name: newStatus.name,
        description: newStatus.description
    }).catch((error) => console.log(error));
    res.status(200).json(status);
});
//route pour créer une Platform via l'Admin
app.post("/admin/platform", async (req, res) => {
    const newPlatform = req.body;
    const platform = await Platform.create({
        name: newPlatform.name,
        description: newPlatform.description
    }).catch((error) => console.log(error));
    res.status(200).json(platform);
});
//route pour créer un genre via l'Admin
app.post("/admin/genre", async (req, res) => {
    const newGenre = req.body;
    const genre = await Genre.create({
        name: newGenre.name,
        description: newGenre.description
    }).catch((error) => console.log(error));
    res.status(200).json(genre);
});
//route pour créer un genre via l'Admin
app.post("/admin/Language", async (req, res) => {
    const newLanguage = req.body;
    const gelanguage = await Language.create({
        name: newLanguage.name,
        code: newLanguage.code
    }).catch((error) => console.log(error));
    res.status(200).json(Language);
});
// routes
app.use('/game', GameRoute);
app.use('/genre', GenreRoute);
app.use('/tag', TagRoute);
app.use('/data', DataRoute);
app.use('/statuses', StatusRoute);
app.use('/platforms', PlatformRoute);
app.use('/controllers', ControllerRoute);
app.use('/language', LanguageRoute);
//relations 
Game.belongsToMany(User, { through: "Comment" });
User.belongsToMany(Game, { through: "Comment" });
Game.belongsToMany(User, { through: "Library" });
User.belongsToMany(Game, { through: "Library" });
Game.belongsToMany(User, { through: "Upload" });
User.belongsToMany(Game, { through: "Upload" });
User.belongsToMany(Game, { through: "Order" });
Game.belongsToMany(User, { through: "Order" });
Game.belongsToMany(Controller, { through: 'GameControllers' });
Controller.belongsToMany(Game, { through: 'GameControllers' });
Game.belongsToMany(Tag, { through: "GameTag" });
Tag.belongsToMany(Game, { through: "GameTag" });
Game.belongsTo(Status, { foreignKey: 'StatusId', as: 'status' });
Status.hasMany(Game, { foreignKey: 'StatusId', as: 'games' });
User.hasOne(Role);
Role.hasMany(User);
Game.belongsToMany(Platform, { through: "GamePlatforms" });
Platform.belongsToMany(Game, { through: "GamePlatforms" });
Game.belongsTo(Language, { foreignKey: 'LanguageId' });
Language.hasMany(Game, { foreignKey: 'LanguageId' });
Game.belongsToMany(Genre, { through: "GameGenre" });
Genre.belongsToMany(Game, { through: "GameGenre" });
Cart.belongsToMany(Game, { through: "GameCart" });
Game.belongsToMany(Cart, { through: "GameCart" });
User.hasOne(Cart);
Cart.belongsTo(User);
app.listen(9090, () => {
    console.log("Server on port 9090");
});
