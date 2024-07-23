import express from "express";
import { Game, GameRoute } from "./Models/Game.js";
import { User } from './Models/User.js';
import { Controller } from './Models/Controller.js';
import { Tag } from './Models/Tag.js';
import { Status } from './Models/Status.js';
import { Platform } from './Models/Platform.js';
import { Genre } from './Models/Genre.js';
const sentance = "Good Good";
console.log(sentance);
const app = express();
app.use(express.json());
// Limit of the Post//
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
// routes
app.use('/game', GameRoute);
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
// Limit of the Post//
//route qui supprime un produit selon son name
app.delete("/game/delete/:name", async (req, res) => {
    const gamename = req.params.name;
    const deletegame = await Game.destroy({
        where: {
            name: gamename
        }
    });
    res.status(200).json("le produit suivant est supprimer : " + deletegame);
});
app.get("/game/stock/:id", async (req, res) => {
    const id = req.params.id;
});
app.listen(9090, () => {
    console.log("Server on port 9090");
});
