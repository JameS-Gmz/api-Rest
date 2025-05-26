import { Game } from './Game.js';
import { User } from './User.js';
import { Role } from './Role.js';
import { Controller } from './Controller.js';
import { Platform } from './Platform.js';
import { Genre } from './Genre.js';
import { Tag } from './Tag.js';
import { Status } from './Status.js';
import { Language } from './Language.js';
import { Cart } from './Cart.js';

export function initializeAssociations() {
    // User-Role Relations
    User.belongsTo(Role, { foreignKey: 'RoleId', as: 'role' });
    Role.hasMany(User, { foreignKey: 'RoleId', as: 'users' });

    // Game-User Relations
    Game.belongsTo(User, { foreignKey: 'UserId', as: 'gameOwner' });
    User.hasMany(Game, { foreignKey: 'UserId', as: 'games' });

    // Game-Status Relations
    Game.belongsTo(Status, { foreignKey: 'StatusId', as: 'status' });
    Status.hasMany(Game, { foreignKey: 'StatusId', as: 'games' });

    // Game-Language Relations
    Game.belongsTo(Language, { foreignKey: 'LanguageId', as: 'language' });
    Language.hasMany(Game, { foreignKey: 'LanguageId', as: 'games' });

    // Game-Controller Relations
    Game.belongsToMany(Controller, { 
        through: 'GameControllers',
        as: 'controllers',
        foreignKey: 'GameId',
        otherKey: 'ControllerId'
    });
    Controller.belongsToMany(Game, { 
        through: 'GameControllers',
        as: 'games',
        foreignKey: 'ControllerId',
        otherKey: 'GameId'
    });

    // Game-Platform Relations
    Game.belongsToMany(Platform, { 
        through: 'GamePlatforms',
        as: 'platforms',
        foreignKey: 'GameId',
        otherKey: 'PlatformId'
    });
    Platform.belongsToMany(Game, { 
        through: 'GamePlatforms',
        as: 'games',
        foreignKey: 'PlatformId',
        otherKey: 'GameId'
    });

    // Game-Genre Relations
    Game.belongsToMany(Genre, { 
        through: 'GameGenres',
        as: 'genres',
        foreignKey: 'GameId',
        otherKey: 'GenreId'
    });
    Genre.belongsToMany(Game, { 
        through: 'GameGenres',
        as: 'games',
        foreignKey: 'GenreId',
        otherKey: 'GameId'
    });

    // Game-Tag Relations
    Game.belongsToMany(Tag, { 
        through: 'GameTags',
        as: 'tags',
        foreignKey: 'GameId',
        otherKey: 'TagId'
    });
    Tag.belongsToMany(Game, { 
        through: 'GameTags',
        as: 'games',
        foreignKey: 'TagId',
        otherKey: 'GameId'
    });

    // User-Game Library Relations
    Game.belongsToMany(User, { 
        through: 'Library',
        as: 'libraryUsers',
        foreignKey: 'GameId',
        otherKey: 'UserId'
    });
    User.belongsToMany(Game, { 
        through: 'Library',
        as: 'libraryGames',
        foreignKey: 'UserId',
        otherKey: 'GameId'
    });

    // User-Game Comment Relations
    Game.belongsToMany(User, { 
        through: 'Comment',
        as: 'commentUsers',
        foreignKey: 'GameId',
        otherKey: 'UserId'
    });
    User.belongsToMany(Game, { 
        through: 'Comment',
        as: 'commentedGames',
        foreignKey: 'UserId',
        otherKey: 'GameId'
    });

    // User-Game Upload Relations
    Game.belongsToMany(User, { 
        through: 'Upload',
        as: 'uploadUsers',
        foreignKey: 'GameId',
        otherKey: 'UserId'
    });
    User.belongsToMany(Game, { 
        through: 'Upload',
        as: 'uploadedGames',
        foreignKey: 'UserId',
        otherKey: 'GameId'
    });

    // User-Game Order Relations
    Game.belongsToMany(User, { 
        through: 'Order',
        as: 'orderUsers',
        foreignKey: 'GameId',
        otherKey: 'UserId'
    });
    User.belongsToMany(Game, { 
        through: 'Order',
        as: 'orderedGames',
        foreignKey: 'UserId',
        otherKey: 'GameId'
    });

    // Cart Relations
    Cart.belongsToMany(Game, {
        through: 'GameCart',
        as: 'games',
        foreignKey: 'CartId',
        otherKey: 'GameId'
    });
    Game.belongsToMany(Cart, {
        through: 'GameCart',
        as: 'carts',
        foreignKey: 'GameId',
        otherKey: 'CartId'
    });

    User.hasOne(Cart, { as: 'cart' });
    Cart.belongsTo(User, { as: 'cartOwner' });
} 