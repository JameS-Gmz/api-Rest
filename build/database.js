import { Sequelize } from "sequelize";
// define tables
const login = {
    database: "PlayForge",
    username: "playadmin",
    password: "playadmin"
};
export const sequelize = new Sequelize(login.database, login.username, login.password, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false //enleve les log de sequelize
});
sequelize.authenticate()
    .then(() => console.log("Connecté à la BDD : PlayForge"))
    .catch((error) => console.log(error));
sequelize.sync({ force: true })
    .then(() => {
    console.log("Les modéles et les tables sont synchronisés");
})
    .catch((error) => (error));
