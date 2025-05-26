import cors from "cors";
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
import { initializeAll } from "./initialization/script.js";
import { initializeAssociations } from "./Models/associations.js";

const app = express();
app.use(express.json());

// CORS configuration
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(cors({
    origin: 'http://localhost:4200',
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  credentials: true
}));

// API Routes
app.use('/game', GameRoute);
app.use('/genres', GenreRoute);
app.use('/tags', TagRoute);
app.use('/data', DataRoute);
app.use('/statuses', StatusRoute);
app.use('/platforms', PlatformRoute);
app.use('/controllers', ControllerRoute);
app.use('/languages', LanguageRoute);
app.use('/user', UserRoute);
app.use('/role', RoleRoute);

// Initialize database and start server
Promise.all([
    initializeAll(),
    initializeAssociations()
]).then(() => {
    app.listen(9090, () => {
        console.log("Server running on port 9090");
    });
}).catch(error => {
    console.error("Error during initialization:", error);
    process.exit(1);
});