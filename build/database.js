import { Sequelize } from "sequelize";
// define tables
const login = {
    database: "PlayForge",
    username: "playAdmin",
    password: "playAdmin"
};
export const sequelize = new Sequelize(login.database, login.username, login.password, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});
sequelize.authenticate()
    .then(() => console.log("Connecté à la BDD : PlayForge"))
    .catch((error) => console.log(error));
sequelize.sync({})
    .then(() => {
    console.log("Les modéles et les tables sont synchronisés");
})
    .catch((error) => console.log(error));
