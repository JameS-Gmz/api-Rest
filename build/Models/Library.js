import { sequelize } from "../database.js";
import { DataTypes } from "sequelize";
export const Library = sequelize.define("Library", {
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    GameId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Games',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    addedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
});
// Fonction pour initialiser les associations
export const initializeAssociations = () => {
    // Définir les associations
    Library.belongsTo(sequelize.models.User, { foreignKey: 'UserId', as: 'user' });
    Library.belongsTo(sequelize.models.Game, { foreignKey: 'GameId', as: 'game' });
    // Ajouter les associations aux modèles User et Game
    sequelize.models.User.hasMany(Library, { foreignKey: 'UserId', as: 'library' });
    sequelize.models.Game.hasMany(Library, { foreignKey: 'GameId', as: 'library' });
};
