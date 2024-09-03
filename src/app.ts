import { Request, Response } from 'express';
import express from "express";
import { GameRoute } from "./Models/Game.js";
import { User } from './Models/User.js';
import { Controller, ControllerRoute } from './Models/Controller.js';
import { Tag, TagRoute } from './Models/Tag.js';
import { Status, StatusRoute } from './Models/Status.js';
import { Platform, PlatformRoute } from './Models/Platform.js';
import { Genre, GenreRoute } from './Models/Genre.js';
import { DataRoute } from './Data.js';
import { Language } from './Models/Language.js';


const app = express();
app.use(express.json());


// error failed to fetch --> Cors head
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Ou spécifiez le domaine explicitement
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});



// route pour créer un user
app.post("/register", async (req: Request, res: Response) => {
    
    const newUser = req.body;
    const user = await User.create({
        
        username: newUser.username,
        name : newUser.name,
        email: newUser.email,
        password: newUser.password,
        avatar: newUser.avatar,
        bio: newUser.bio,
    }).catch((error: Error) => console.log(error))
    res.status(200).json(user);
});

//route pour créer un Controller via l'admin
app.post("/admin/controller", async (req: Request, res: Response) => {
    
    const newController = req.body;
    const controller = await Controller.create({
        
        name: newController.name,
        description: newController.description
        
    }).catch((error: Error) => console.log(error))
    res.status(200).json(controller);
});

//route pour créer un Tag via l'Admin
app.post("/admin/tag", async (req: Request, res: Response) => {
    
    const newTag = req.body;
    const tag = await Tag.create({
        
        name: newTag.name,
        description: newTag.description
        
    }).catch((error: Error) => console.log(error))
    res.status(200).json(tag);
});


//route pour créer un Status via l'Admin
app.post("/admin/status", async (req: Request, res: Response) => {
    
    const newStatus = req.body;
    const status = await Status.create({
        
        name: newStatus.name,
        description: newStatus.description
        
    }).catch((error: Error) => console.log(error))
    res.status(200).json(status);
});

//route pour créer une Platform via l'Admin
app.post("/admin/platform", async (req: Request, res: Response) => {
    
    const newPlatform = req.body;
    const platform = await Platform.create({
        
        name: newPlatform.name,
        description: newPlatform.description
        
    }).catch((error: Error) => console.log(error))
    res.status(200).json(platform);
});

//route pour créer un genre via l'Admin
app.post("/admin/genre", async (req: Request, res: Response) => {
    
    const newGenre = req.body;
    const genre = await Genre.create({
        
        name: newGenre.name,
        description: newGenre.description
        
    }).catch((error: Error) => console.log(error))
    res.status(200).json(genre);
});

//route pour créer un genre via l'Admin
app.post("/admin/Language", async (req: Request, res: Response) => {
    
    const newLanguage = req.body;
    const gelanguage = await Language.create({
        
        name: newLanguage.name,
        code: newLanguage.code
        
    }).catch((error: Error) => console.log(error))
    res.status(200).json(Language);
});


// routes
app.use('/game',GameRoute);
app.use('/genre',GenreRoute);
app.use('/tag',TagRoute);
app.use('/data',DataRoute);
app.use('/statuses',StatusRoute);
app.use('/platforms',PlatformRoute);
app.use('/controllers',ControllerRoute);

// Limit of the Post//
app.listen(9090, () => {
    console.log("Server on port 9090")
})