import  cors  from "cors";
import express from "express";
import { Game, GameRoute } from "./Models/Game.js";
import { User, UserRoute } from './Models/User.js';
import { Controller, ControllerRoute } from './Models/Controller.js';
import { Tag, TagRoute } from './Models/Tag.js';
import { Status, StatusRoute } from './Models/Status.js';
import { Platform, PlatformRoute } from './Models/Platform.js';
import { Genre, GenreRoute } from './Models/Genre.js';
import { DataRoute } from './Data.js';
import { Language, LanguageRoute } from './Models/Language.js';
import { Role, RoleRoute } from "./Models/Role.js";
import { Cart } from "./Models/Cart.js";
import { initializeAll } from "./initialization/script.js";

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
  origin: 'http://localhost:4200',  // Remplace par l'URL de ton front-end
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  credentials: true
}));

// routes
app.use('/game',GameRoute);
app.use('/genres',GenreRoute);
app.use('/tags',TagRoute);
app.use('/data',DataRoute);
app.use('/statuses',StatusRoute);
app.use('/platforms',PlatformRoute);
app.use('/controllers',ControllerRoute);
app.use('/languages',LanguageRoute)
app.use('/user',UserRoute)
app.use('/role',RoleRoute)

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

Game.belongsToMany(Tag,{through:"GameTags"});
Tag.belongsToMany(Game,{through:"GameTags"});

Game.belongsTo(Status, { foreignKey: 'StatusId', as: 'status' });
Status.hasMany(Game, { foreignKey: 'StatusId', as: 'games' });

User.belongsTo(Role, { foreignKey: 'RoleId', as: 'role'});
Role.hasMany(User, { foreignKey: 'RoleId' });

Game.belongsToMany(Platform,{through:"GamePlatforms"});
Platform.belongsToMany(Game,{through:"GamePlatforms"});

Game.belongsTo(Language, { foreignKey: 'LanguageId' as 'language'});
Language.hasMany(Game, { foreignKey: 'LanguageId' as 'games'});

Game.belongsToMany(Genre, { through: "GameGenres" });
Genre.belongsToMany(Game, { through: "GameGenres" });

Cart.belongsToMany(Game,{through:"GameCart"});
Game.belongsToMany(Cart,{through:"GameCart"});

User.hasOne(Cart);
Cart.belongsTo(User);

// Initialiser la base de données avant de démarrer le serveur
initializeAll().then(() => {
    app.listen(9090, () => {
        console.log("Server on port 9090")
    });
}).catch(error => {
    console.error("Erreur lors de l'initialisation:", error);
});