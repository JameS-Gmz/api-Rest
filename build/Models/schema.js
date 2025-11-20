import { mysqlTable, int, varchar, text, double, datetime, timestamp, primaryKey, index } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
// ============================================
// TABLES PRINCIPALES
// ============================================
// Table: Roles
export const roles = mysqlTable('Roles', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 100 }).notNull().default('Default Role Name'),
    description: varchar('description', { length: 255 }),
}, (table) => ({
    nameIdx: index('name_idx').on(table.name),
}));
// Table: Users
export const users = mysqlTable('Users', {
    id: int('id').primaryKey().autoincrement(),
    username: varchar('username', { length: 50 }).notNull(),
    email: varchar('email', { length: 50 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    bio: varchar('bio', { length: 100 }),
    avatar: varchar('avatar', { length: 255 }),
    birthday: datetime('birthday'),
    RoleId: int('RoleId'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow(),
}, (table) => ({
    emailIdx: index('email_idx').on(table.email),
    roleIdIdx: index('RoleId_idx').on(table.RoleId),
}));
// Table: Statuses
export const statuses = mysqlTable('Statuses', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 100 }),
    description: varchar('description', { length: 500 }),
}, (table) => ({
    nameIdx: index('name_idx').on(table.name),
}));
// Table: Languages
export const languages = mysqlTable('Languages', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 100 }),
    description: varchar('description', { length: 500 }),
}, (table) => ({
    nameIdx: index('name_idx').on(table.name),
}));
// Table: Controllers
export const controllers = mysqlTable('Controllers', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
}, (table) => ({
    nameIdx: index('name_idx').on(table.name),
}));
// Table: Platforms
export const platforms = mysqlTable('Platforms', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 100 }),
    description: varchar('description', { length: 500 }),
}, (table) => ({
    nameIdx: index('name_idx').on(table.name),
}));
// Table: Genres
export const genres = mysqlTable('Genres', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 50 }).notNull(),
}, (table) => ({
    nameIdx: index('name_idx').on(table.name),
}));
// Table: Tags
export const tags = mysqlTable('Tags', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 100 }),
    description: varchar('description', { length: 600 }),
}, (table) => ({
    nameIdx: index('name_idx').on(table.name),
}));
// Table: Games
export const games = mysqlTable('Games', {
    id: int('id').primaryKey().autoincrement(),
    title: varchar('title', { length: 100 }).notNull(),
    price: double('price').notNull().default(0),
    authorStudio: varchar('authorStudio', { length: 255 }),
    madewith: varchar('madewith', { length: 255 }),
    description: varchar('description', { length: 1500 }),
    StatusId: int('StatusId'),
    LanguageId: int('LanguageId'),
    UserId: int('UserId'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow(),
}, (table) => ({
    titleIdx: index('title_idx').on(table.title),
    statusIdIdx: index('StatusId_idx').on(table.StatusId),
    languageIdIdx: index('LanguageId_idx').on(table.LanguageId),
    userIdIdx: index('UserId_idx').on(table.UserId),
    priceIdx: index('price_idx').on(table.price),
}));
// Table: Carts
export const carts = mysqlTable('Carts', {
    id: int('id').primaryKey().autoincrement(),
    quantity: int('quantity'),
    UserId: int('UserId'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow(),
}, (table) => ({
    userIdIdx: index('UserId_idx').on(table.UserId),
}));
// ============================================
// TABLES DE JOINTURE (Many-to-Many)
// ============================================
// Table: GameControllers
export const gameControllers = mysqlTable('GameControllers', {
    GameId: int('GameId').notNull(),
    ControllerId: int('ControllerId').notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.GameId, table.ControllerId] }),
    gameIdIdx: index('GameId_idx').on(table.GameId),
    controllerIdIdx: index('ControllerId_idx').on(table.ControllerId),
}));
// Table: GamePlatforms
export const gamePlatforms = mysqlTable('GamePlatforms', {
    GameId: int('GameId').notNull(),
    PlatformId: int('PlatformId').notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.GameId, table.PlatformId] }),
    gameIdIdx: index('GameId_idx').on(table.GameId),
    platformIdIdx: index('PlatformId_idx').on(table.PlatformId),
}));
// Table: GameGenres
export const gameGenres = mysqlTable('GameGenres', {
    GameId: int('GameId').notNull(),
    GenreId: int('GenreId').notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.GameId, table.GenreId] }),
    gameIdIdx: index('GameId_idx').on(table.GameId),
    genreIdIdx: index('GenreId_idx').on(table.GenreId),
}));
// Table: GameTags
export const gameTags = mysqlTable('GameTags', {
    GameId: int('GameId').notNull(),
    TagId: int('TagId').notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.GameId, table.TagId] }),
    gameIdIdx: index('GameId_idx').on(table.GameId),
    tagIdIdx: index('TagId_idx').on(table.TagId),
}));
// Table: Library (User-Game)
export const library = mysqlTable('Library', {
    UserId: int('UserId').notNull(),
    GameId: int('GameId').notNull(),
    addedAt: timestamp('addedAt').defaultNow(),
}, (table) => ({
    pk: primaryKey({ columns: [table.UserId, table.GameId] }),
    userIdIdx: index('UserId_idx').on(table.UserId),
    gameIdIdx: index('GameId_idx').on(table.GameId),
}));
// Table: Comment (User-Game)
export const comments = mysqlTable('Comment', {
    id: int('id').primaryKey().autoincrement(),
    UserId: int('UserId').notNull(),
    GameId: int('GameId').notNull(),
    content: text('content'),
    rating: int('rating'), // Note de 1 à 5
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow(),
}, (table) => ({
    userIdIdx: index('UserId_idx').on(table.UserId),
    gameIdIdx: index('GameId_idx').on(table.GameId),
}));
// Table: Upload (User-Game)
export const uploads = mysqlTable('Upload', {
    id: int('id').primaryKey().autoincrement(),
    UserId: int('UserId').notNull(),
    GameId: int('GameId').notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
}, (table) => ({
    userIdIdx: index('UserId_idx').on(table.UserId),
    gameIdIdx: index('GameId_idx').on(table.GameId),
}));
// Table: Order (User-Game)
export const orders = mysqlTable('Order', {
    id: int('id').primaryKey().autoincrement(),
    UserId: int('UserId').notNull(),
    GameId: int('GameId').notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
}, (table) => ({
    userIdIdx: index('UserId_idx').on(table.UserId),
    gameIdIdx: index('GameId_idx').on(table.GameId),
}));
// Table: GameCart
export const gameCart = mysqlTable('GameCart', {
    CartId: int('CartId').notNull(),
    GameId: int('GameId').notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.CartId, table.GameId] }),
    cartIdIdx: index('CartId_idx').on(table.CartId),
    gameIdIdx: index('GameId_idx').on(table.GameId),
}));
// ============================================
// RELATIONS DRIZZLE ORM
// ============================================
// Relations: Users
export const usersRelations = relations(users, ({ one, many }) => ({
    role: one(roles, {
        fields: [users.RoleId],
        references: [roles.id],
        relationName: 'userRole',
    }),
    games: many(games, { relationName: 'gameOwner' }),
    libraryGames: many(library, { relationName: 'libraryUsers' }),
    commentedGames: many(comments, { relationName: 'commentUsers' }),
    uploadedGames: many(uploads, { relationName: 'uploadUsers' }),
    orderedGames: many(orders, { relationName: 'orderUsers' }),
    cart: one(carts, {
        fields: [users.id],
        references: [carts.UserId],
        relationName: 'cartOwner',
    }),
}));
// Relations: Roles
export const rolesRelations = relations(roles, ({ many }) => ({
    users: many(users, { relationName: 'userRole' }),
}));
// Relations: Games
export const gamesRelations = relations(games, ({ one, many }) => ({
    gameOwner: one(users, {
        fields: [games.UserId],
        references: [users.id],
        relationName: 'gameOwner',
    }),
    status: one(statuses, {
        fields: [games.StatusId],
        references: [statuses.id],
        relationName: 'gameStatus',
    }),
    language: one(languages, {
        fields: [games.LanguageId],
        references: [languages.id],
        relationName: 'gameLanguage',
    }),
    controllers: many(gameControllers, { relationName: 'gameControllers' }),
    platforms: many(gamePlatforms, { relationName: 'gamePlatforms' }),
    genres: many(gameGenres, { relationName: 'gameGenres' }),
    tags: many(gameTags, { relationName: 'gameTags' }),
    libraryUsers: many(library, { relationName: 'libraryGames' }),
    commentUsers: many(comments, { relationName: 'commentedGames' }),
    uploadUsers: many(uploads, { relationName: 'uploadedGames' }),
    orderUsers: many(orders, { relationName: 'orderedGames' }),
    carts: many(gameCart, { relationName: 'gameCarts' }),
}));
// Relations: Statuses
export const statusesRelations = relations(statuses, ({ many }) => ({
    games: many(games, { relationName: 'gameStatus' }),
}));
// Relations: Languages
export const languagesRelations = relations(languages, ({ many }) => ({
    games: many(games, { relationName: 'gameLanguage' }),
}));
// Relations: Controllers
export const controllersRelations = relations(controllers, ({ many }) => ({
    games: many(gameControllers, { relationName: 'controllerGames' }),
}));
// Relations: Platforms
export const platformsRelations = relations(platforms, ({ many }) => ({
    games: many(gamePlatforms, { relationName: 'platformGames' }),
}));
// Relations: Genres
export const genresRelations = relations(genres, ({ many }) => ({
    games: many(gameGenres, { relationName: 'genreGames' }),
}));
// Relations: Tags
export const tagsRelations = relations(tags, ({ many }) => ({
    games: many(gameTags, { relationName: 'tagGames' }),
}));
// Relations: Carts
export const cartsRelations = relations(carts, ({ one, many }) => ({
    cartOwner: one(users, {
        fields: [carts.UserId],
        references: [users.id],
        relationName: 'cartOwner',
    }),
    games: many(gameCart, { relationName: 'cartGames' }),
}));
// Relations: GameControllers (junction table)
export const gameControllersRelations = relations(gameControllers, ({ one }) => ({
    game: one(games, {
        fields: [gameControllers.GameId],
        references: [games.id],
        relationName: 'gameControllers',
    }),
    controller: one(controllers, {
        fields: [gameControllers.ControllerId],
        references: [controllers.id],
        relationName: 'controllerGames',
    }),
}));
// Relations: GamePlatforms (junction table)
export const gamePlatformsRelations = relations(gamePlatforms, ({ one }) => ({
    game: one(games, {
        fields: [gamePlatforms.GameId],
        references: [games.id],
        relationName: 'gamePlatforms',
    }),
    platform: one(platforms, {
        fields: [gamePlatforms.PlatformId],
        references: [platforms.id],
        relationName: 'platformGames',
    }),
}));
// Relations: GameGenres (junction table)
export const gameGenresRelations = relations(gameGenres, ({ one }) => ({
    game: one(games, {
        fields: [gameGenres.GameId],
        references: [games.id],
        relationName: 'gameGenres',
    }),
    genre: one(genres, {
        fields: [gameGenres.GenreId],
        references: [genres.id],
        relationName: 'genreGames',
    }),
}));
// Relations: GameTags (junction table)
export const gameTagsRelations = relations(gameTags, ({ one }) => ({
    game: one(games, {
        fields: [gameTags.GameId],
        references: [games.id],
        relationName: 'gameTags',
    }),
    tag: one(tags, {
        fields: [gameTags.TagId],
        references: [tags.id],
        relationName: 'tagGames',
    }),
}));
// Relations: Library (junction table)
export const libraryRelations = relations(library, ({ one }) => ({
    user: one(users, {
        fields: [library.UserId],
        references: [users.id],
        relationName: 'libraryUsers',
    }),
    game: one(games, {
        fields: [library.GameId],
        references: [games.id],
        relationName: 'libraryGames',
    }),
}));
// Relations: Comments
export const commentsRelations = relations(comments, ({ one }) => ({
    user: one(users, {
        fields: [comments.UserId],
        references: [users.id],
        relationName: 'commentUsers',
    }),
    game: one(games, {
        fields: [comments.GameId],
        references: [games.id],
        relationName: 'commentedGames',
    }),
}));
// Relations: Uploads
export const uploadsRelations = relations(uploads, ({ one }) => ({
    user: one(users, {
        fields: [uploads.UserId],
        references: [users.id],
        relationName: 'uploadUsers',
    }),
    game: one(games, {
        fields: [uploads.GameId],
        references: [games.id],
        relationName: 'uploadedGames',
    }),
}));
// Relations: Orders
export const ordersRelations = relations(orders, ({ one }) => ({
    user: one(users, {
        fields: [orders.UserId],
        references: [users.id],
        relationName: 'orderUsers',
    }),
    game: one(games, {
        fields: [orders.GameId],
        references: [games.id],
        relationName: 'orderedGames',
    }),
}));
// Relations: GameCart (junction table)
export const gameCartRelations = relations(gameCart, ({ one }) => ({
    cart: one(carts, {
        fields: [gameCart.CartId],
        references: [carts.id],
        relationName: 'cartGames',
    }),
    game: one(games, {
        fields: [gameCart.GameId],
        references: [games.id],
        relationName: 'gameCarts',
    }),
}));
