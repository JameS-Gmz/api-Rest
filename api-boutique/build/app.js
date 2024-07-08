import express from "express";
const sentance = "Good Good";
console.log(sentance);
const app = express();
import { Product } from "./database.js";
import { Op } from "sequelize";
app.use(express.json());
// route pour envoyer un produit
app.post("/product", async (req, res) => {
    const newProduct = req.body;
    const product = await Product.create({
        name: newProduct.name,
        price: newProduct.price,
        describe: newProduct.describe,
        stock: newProduct.stock
    });
    res.status(200).json(product);
});
//route pour recuperer tous les produits
app.get("/products", async (req, res) => {
    const products = await Product.findAll();
    res.status(200).json(products);
});
//route qui recupere un produit avec soit l'id soit le name
app.get("/product/:identifier", async (req, res) => {
    const identifier = req.params.identifier;
    const product = await Product.findOne({
        where: {
            [Op.or]: [{ name: identifier }, { id: identifier }],
        }
    });
    res.status(200).json(product);
});
//route qui recupere un produit uniquement avec son ID
app.get("/product/id/:id", async (req, res) => {
    const product_id = req.params.id;
    const product = await Product.findByPk(product_id);
    res.status(200).json(product);
});
//route qui recupere un produit uniquement avec son name
app.get("/product/name/:name", async (req, res) => {
    const product_name = req.params.name;
    const product = await Product.findAll({
        where: {
            name: product_name
        }
    });
    res.status(200).json(product);
});
//route qui recupere des produits avec un stock minimum
app.get("/products/stock/:min", async (req, res) => {
    const min = req.params.min;
    const products = await Product.findAll({
        where: {
            stock: {
                [Op.gte]: min
            }
        }
    });
    res.status(200).json(products);
});
//route qui recupere des produits selon une intervalle de pris definis par l'utilisateur
app.get("/products/price/:min/:max", async (req, res) => {
    const min = req.params.min;
    const max = req.params.max;
    const products = await Product.findAll({
        where: {
            price: {
                [Op.between]: [min, max]
            }
        }
    });
    res.status(200).json(products);
});
app.delete("/products/:text", async (req, res) => {
    const text = req.params.text;
    const nbDeletedProducts = await Product.destroy({
        where: {
            [Op.or]: [
                { id: isNaN(Number(text)) ? 0 : text }, //operateur ternaire => const r == conditions? valretour1 : valretour2
                { name: text }
            ]
        }
    });
    if (nbDeletedProducts == 0) {
        res.status(404).json("Aucun produit trouvé");
    }
    else {
        res.status(200).json("Tous les produits contenant le mot ou l'id suivant ont été supprimés : " + text);
    }
});
//route qui supprime un produit selon son name
app.delete("/product/delete/:name", async (req, res) => {
    const productname = req.params.name;
    const deleteproduct = await Product.destroy({
        where: {
            name: productname
        }
    });
    res.status(200).json("le produit suivant est supprimer : " + productname);
});
app.get("/product/stock/:id", async (req, res) => {
    const id = req.params.id;
});
app.listen(9090, () => {
    console.log("Server on port 9090");
});
