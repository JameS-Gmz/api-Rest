import { Sequelize, DataTypes } from "sequelize";

// define tables
const login = {
    database: "exo",
    username: "exo",
    password: "exo"
};
const sequelize = new Sequelize(login.database, login.username, login.password, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false //enleve les log de sequelize
});
sequelize.authenticate()
    .then(() => console.log("Connecté à la BDD : "))
    .catch((error) => console.log(error));
// const Pokemon = require("./pokemon.js").Pokemon(sequelize)
// const Dresseur = require("./dresseur.js").Dresseur(sequelize)
export const Product = sequelize.define("Product", {
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    stock: DataTypes.DECIMAL
});
sequelize.sync({ force: true })
    .then(() => {
    Product.create({
        name: "Nike taille 42",
        price: 200,
        stock: 25
    });
})
    .then(() => {
    const products = Product.bulkCreate([
        { name: "Adidas taille 42", price: 100, stock: 12 },
        { name: "Nike air 45", price: 150, stock: 3 },
        { name: "Pantalon celio", price: 45, stock: 9 }
    ]);
    console.log("Les modéles et les tables sont synchronisés");
})
    .catch((error) => (error));

