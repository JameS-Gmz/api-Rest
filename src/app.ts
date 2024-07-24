import { Request, Response } from 'express';
import express from "express";
import { Game, GameRoute } from "./Models/Game.js";
import { Op } from "sequelize"
import { User } from './Models/User.js';
import { Controller } from './Models/Controller.js';
import { Tag } from './Models/Tag.js';
import { Status } from './Models/Status.js';
import { Platform } from './Models/Platform.js';
import { Genre } from './Models/Genre.js';


const sentance: String = "Good Good"
console.log(sentance)
const app = express();
app.use(express.json());

// Limit of the Post//

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

// routes
app.use('/game',GameRoute);



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


// Limit of the Post//

app.listen(9090, () => {
    console.log("Server on port 9090")
})