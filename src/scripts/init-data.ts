import { db } from '../database-drizzle.js';
import {
    roles, users, statuses, languages, controllers, platforms, genres, tags, games,
    gameControllers, gamePlatforms, gameGenres, gameTags, library
} from '../Models/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

/**
 * Script d'initialisation des données de base
 */

// ============================================
// ROLES
// ============================================
async function initRoles() {
    console.log('🔐 Initialisation des rôles...');
    
    const rolesData = [
        { name: 'user', description: 'Utilisateur standard' },
        { name: 'developer', description: 'Développeur de jeux' },
        { name: 'admin', description: 'Administrateur' },
        { name: 'superadmin', description: 'Super administrateur' },
    ];

    for (const roleData of rolesData) {
        const existing = await db.select().from(roles).where(eq(roles.name, roleData.name)).limit(1);
        if (existing.length === 0) {
            await db.insert(roles).values(roleData);
            console.log(`  ✅ Rôle '${roleData.name}' créé`);
        } else {
            console.log(`  ℹ️  Rôle '${roleData.name}' existe déjà`);
        }
    }
}

// ============================================
// STATUSES
// ============================================
async function initStatuses() {
    console.log('📊 Initialisation des statuts...');
    
    const statusesData = [
        { name: 'Disponible', description: 'Jeu disponible à l\'achat' },
        { name: 'En développement', description: 'Jeu en cours de développement' },
        { name: 'Bêta', description: 'Version bêta du jeu' },
        { name: 'Gratuit', description: 'Jeu gratuit' },
        { name: 'Hors ligne', description: 'Jeu temporairement indisponible' },
    ];

    for (const statusData of statusesData) {
        const existing = await db.select().from(statuses).where(eq(statuses.name, statusData.name)).limit(1);
        if (existing.length === 0) {
            await db.insert(statuses).values(statusData);
            console.log(`  ✅ Statut '${statusData.name}' créé`);
        } else {
            console.log(`  ℹ️  Statut '${statusData.name}' existe déjà`);
        }
    }
}

// ============================================
// LANGUAGES
// ============================================
async function initLanguages() {
    console.log('🌍 Initialisation des langues...');
    
    const languagesData = [
        { name: 'Français', description: 'Langue française' },
        { name: 'Anglais', description: 'Langue anglaise' },
        { name: 'Espagnol', description: 'Langue espagnole' },
        { name: 'Allemand', description: 'Langue allemande' },
        { name: 'Italien', description: 'Langue italienne' },
    ];

    for (const languageData of languagesData) {
        const existing = await db.select().from(languages).where(eq(languages.name, languageData.name)).limit(1);
        if (existing.length === 0) {
            await db.insert(languages).values(languageData);
            console.log(`  ✅ Langue '${languageData.name}' créée`);
        } else {
            console.log(`  ℹ️  Langue '${languageData.name}' existe déjà`);
        }
    }
}

// ============================================
// CONTROLLERS
// ============================================
async function initControllers() {
    console.log('🎮 Initialisation des contrôleurs...');
    
    const controllersData = [
        { name: 'Clavier/Souris', description: 'Contrôle au clavier et à la souris' },
        { name: 'Manette', description: 'Contrôle à la manette de jeu' },
        { name: 'Tactile', description: 'Contrôle tactile (écran)' },
        { name: 'VR', description: 'Contrôleur de réalité virtuelle' },
    ];

    for (const controllerData of controllersData) {
        const existing = await db.select().from(controllers).where(eq(controllers.name, controllerData.name)).limit(1);
        if (existing.length === 0) {
            await db.insert(controllers).values(controllerData);
            console.log(`  ✅ Contrôleur '${controllerData.name}' créé`);
        } else {
            console.log(`  ℹ️  Contrôleur '${controllerData.name}' existe déjà`);
        }
    }
}

// ============================================
// PLATFORMS
// ============================================
async function initPlatforms() {
    console.log('💻 Initialisation des plateformes...');
    
    const platformsData = [
        { name: 'PC', description: 'Plateforme PC (Windows, Linux, Mac)' },
        { name: 'Web', description: 'Jeu jouable dans le navigateur' },
        { name: 'Mobile', description: 'Plateforme mobile (iOS, Android)' },
        { name: 'Console', description: 'Console de jeu' },
    ];

    for (const platformData of platformsData) {
        const existing = await db.select().from(platforms).where(eq(platforms.name, platformData.name)).limit(1);
        if (existing.length === 0) {
            await db.insert(platforms).values(platformData);
            console.log(`  ✅ Plateforme '${platformData.name}' créée`);
        } else {
            console.log(`  ℹ️  Plateforme '${platformData.name}' existe déjà`);
        }
    }
}

// ============================================
// GENRES
// ============================================
async function initGenres() {
    console.log('🎯 Initialisation des genres...');
    
    const genresData = [
        { name: 'FPS', description: 'First-Person Shooter' },
        { name: 'Survival', description: 'Survival games' },
        { name: 'Action-Adventure', description: 'Combines elements of action and adventure' },
        { name: 'RPG', description: 'Role-Playing Game' },
        { name: 'Roguelike', description: 'Dungeon crawl with permanent death' },
        { name: 'Simulation', description: 'Real-world simulation games' },
        { name: 'RTS', description: 'Real-Time Strategy' },
        { name: 'Rhythm', description: 'Music and rhythm-based games' },
        { name: 'Hack and Slash', description: 'Combat-oriented games with melee weapons' },
        { name: 'Reflection', description: 'Puzzle-based or logic games' },
        { name: 'Beat Them All', description: 'Games focused on brawling combat' },
        { name: 'Platformer', description: 'Jumping between platforms, navigating levels' },
        { name: 'TPS', description: 'Third-Person Shooter' },
        { name: 'Combat', description: 'Hand-to-hand fighting games' },
        { name: 'Battle Royale', description: 'Last player standing in an open map' },
        { name: 'MMORPG', description: 'Massively Multiplayer Online Role-Playing Game' },
        { name: 'MOBA', description: 'Multiplayer Online Battle Arena' },
        { name: 'Party Games', description: 'Multiplayer games for parties' },
        { name: 'Puzzlers', description: 'Games based on puzzle-solving' },
    ];

    for (const genreData of genresData) {
        const existing = await db.select().from(genres).where(eq(genres.name, genreData.name)).limit(1);
        if (existing.length === 0) {
            await db.insert(genres).values(genreData);
            console.log(`  ✅ Genre '${genreData.name}' créé`);
        } else {
            console.log(`  ℹ️  Genre '${genreData.name}' existe déjà`);
        }
    }
}

// ============================================
// TAGS
// ============================================
async function initTags() {
    console.log('🏷️  Initialisation des tags...');
    
    const tagsData = [
        { name: 'Multiplayer', description: 'Jeu multijoueur' },
        { name: 'Single Player', description: 'Jeu solo' },
        { name: 'Co-op', description: 'Mode coopératif' },
        { name: 'Competitive', description: 'Jeu compétitif' },
        { name: 'Casual', description: 'Jeu casual' },
        { name: 'Hardcore', description: 'Jeu hardcore' },
        { name: 'Indie', description: 'Jeu indépendant' },
        { name: 'AAA', description: 'Jeu triple A' },
        { name: 'Free to Play', description: 'Gratuit à jouer' },
        { name: 'Early Access', description: 'Accès anticipé' },
    ];

    for (const tagData of tagsData) {
        const existing = await db.select().from(tags).where(eq(tags.name, tagData.name)).limit(1);
        if (existing.length === 0) {
            await db.insert(tags).values(tagData);
            console.log(`  ✅ Tag '${tagData.name}' créé`);
        } else {
            console.log(`  ℹ️  Tag '${tagData.name}' existe déjà`);
        }
    }
}

// ============================================
// USERS
// ============================================
async function initUsers() {
    console.log('👤 Initialisation des utilisateurs...');
    
    // Récupérer les rôles
    const [userRole, devRole, adminRole, superAdminRole] = await Promise.all([
        db.select().from(roles).where(eq(roles.name, 'user')).limit(1),
        db.select().from(roles).where(eq(roles.name, 'developer')).limit(1),
        db.select().from(roles).where(eq(roles.name, 'admin')).limit(1),
        db.select().from(roles).where(eq(roles.name, 'superadmin')).limit(1),
    ]);

    const usersData = [
        {
            username: 'admin',
            email: 'admin@playforge.com',
            password: await bcrypt.hash('admin123', 12),
            bio: 'Administrateur principal',
            RoleId: adminRole[0]?.id || null,
        },
        {
            username: 'dev1',
            email: 'dev1@playforge.com',
            password: await bcrypt.hash('dev123', 12),
            bio: 'Développeur de jeux',
            RoleId: devRole[0]?.id || null,
        },
        {
            username: 'user1',
            email: 'user1@playforge.com',
            password: await bcrypt.hash('user123', 12),
            bio: 'Utilisateur standard',
            RoleId: userRole[0]?.id || null,
        },
        {
            username: 'superadmin',
            email: 'superadmin@playforge.com',
            password: await bcrypt.hash('super123', 12),
            bio: 'Super administrateur',
            RoleId: superAdminRole[0]?.id || null,
        },
    ];

    for (const userData of usersData) {
        const existing = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
        if (existing.length === 0) {
            await db.insert(users).values(userData);
            console.log(`  ✅ Utilisateur '${userData.username}' créé`);
        } else {
            console.log(`  ℹ️  Utilisateur '${userData.username}' existe déjà`);
        }
    }
}

// ============================================
// GAMES
// ============================================
async function initGames() {
    console.log('🎮 Initialisation des jeux...');
    
    // Récupérer les IDs nécessaires
    const [statusAvailable, statusDev, languageFr, languageEn, devUser] = await Promise.all([
        db.select().from(statuses).where(eq(statuses.name, 'Disponible')).limit(1),
        db.select().from(statuses).where(eq(statuses.name, 'En développement')).limit(1),
        db.select().from(languages).where(eq(languages.name, 'Français')).limit(1),
        db.select().from(languages).where(eq(languages.name, 'Anglais')).limit(1),
        db.select().from(users).where(eq(users.username, 'dev1')).limit(1),
    ]);

    const gamesData = [
        {
            title: 'Battle Quest',
            price: 19.99,
            authorStudio: 'Epic Games Studio',
            madewith: 'Unreal Engine 5',
            description: 'An epic action-adventure game with breathtaking visuals and a compelling storyline. Embark on a journey through mystical realms, battle fearsome creatures, and uncover ancient secrets.',
            StatusId: statusAvailable[0]?.id || null,
            LanguageId: languageEn[0]?.id || null,
            UserId: devUser[0]?.id || null,
        },
        {
            title: 'Survival Island',
            price: 14.99,
            authorStudio: 'Survive Studios',
            madewith: 'Unity',
            description: 'A survival game where you must gather resources and fight for your life on a deserted island. Build shelters, craft tools, and survive against the elements and dangerous wildlife.',
            StatusId: statusAvailable[0]?.id || null,
            LanguageId: languageEn[0]?.id || null,
            UserId: devUser[0]?.id || null,
        },
        {
            title: 'Space Odyssey',
            price: 29.99,
            authorStudio: 'Galaxy Interactive',
            madewith: 'Godot Engine',
            description: 'A space exploration game set in a massive open world with realistic physics and environments. Explore distant planets, discover alien civilizations, and build your own space empire.',
            StatusId: statusAvailable[0]?.id || null,
            LanguageId: languageEn[0]?.id || null,
            UserId: devUser[0]?.id || null,
        },
        {
            title: 'Fantasy Warriors',
            price: 39.99,
            authorStudio: 'Dragon Lore Studios',
            madewith: 'RPG Maker',
            description: 'A role-playing game filled with fantasy creatures, magic, and heroic quests. Create your character, choose your path, and become a legendary warrior in a world of magic and adventure.',
            StatusId: statusAvailable[0]?.id || null,
            LanguageId: languageFr[0]?.id || null,
            UserId: devUser[0]?.id || null,
        },
        {
            title: 'Rhythm Beat',
            price: 9.99,
            authorStudio: 'Beat Masters',
            madewith: 'Custom Engine',
            description: 'A fast-paced rhythm game that challenges your musical and reflex skills. Follow the beat, hit the notes, and become a rhythm master in this addictive music game.',
            StatusId: statusAvailable[0]?.id || null,
            LanguageId: languageEn[0]?.id || null,
            UserId: devUser[0]?.id || null,
        },
        {
            title: 'Rogue Dungeon',
            price: 24.99,
            authorStudio: 'Dungeon Crawler Inc.',
            madewith: 'Godot Engine',
            description: 'A roguelike dungeon crawler with procedurally generated levels and permadeath. Each run is unique, and death is permanent. Can you survive the depths?',
            StatusId: statusAvailable[0]?.id || null,
            LanguageId: languageEn[0]?.id || null,
            UserId: devUser[0]?.id || null,
        },
        {
            title: 'Simulator Pro',
            price: 34.99,
            authorStudio: 'SimPro Studios',
            madewith: 'Unity',
            description: 'The ultimate simulation game, where you can create and manage everything from cities to farms. Build, manage, and expand your empire in this comprehensive simulation experience.',
            StatusId: statusAvailable[0]?.id || null,
            LanguageId: languageEn[0]?.id || null,
            UserId: devUser[0]?.id || null,
        },
        {
            title: 'Cyber Heist',
            price: 27.99,
            authorStudio: 'Neon Games',
            madewith: 'Unreal Engine 5',
            description: 'A cyberpunk action game set in a dystopian future. Hack systems, fight corporate security, and pull off the ultimate heist in this high-tech adventure.',
            StatusId: statusDev[0]?.id || null,
            LanguageId: languageEn[0]?.id || null,
            UserId: devUser[0]?.id || null,
        },
        {
            title: 'Mystic Realm',
            price: 22.99,
            authorStudio: 'Magic Forge',
            madewith: 'Unity',
            description: 'Explore a magical realm filled with wizards, dragons, and ancient magic. Cast spells, solve puzzles, and uncover the mysteries of the mystical world.',
            StatusId: statusAvailable[0]?.id || null,
            LanguageId: languageFr[0]?.id || null,
            UserId: devUser[0]?.id || null,
        },
        {
            title: 'Racing Legends',
            price: 31.99,
            authorStudio: 'Speed Games',
            madewith: 'Unreal Engine 5',
            description: 'Experience the thrill of high-speed racing in the most realistic racing simulator. Customize your cars, race on legendary tracks, and become a racing legend.',
            StatusId: statusAvailable[0]?.id || null,
            LanguageId: languageEn[0]?.id || null,
            UserId: devUser[0]?.id || null,
        },
    ];

    // Récupérer toutes les catégories pour les relations
    const [allControllers, allPlatforms, allGenres, allTags] = await Promise.all([
        db.select().from(controllers),
        db.select().from(platforms),
        db.select().from(genres),
        db.select().from(tags),
    ]);

    // Configuration des relations par jeu
    const gameRelations: Record<string, { genres: string[], controllers: string[], platforms: string[], tags: string[] }> = {
        'Battle Quest': {
            genres: ['FPS', 'Action-Adventure'],
            controllers: ['Clavier/Souris', 'Manette'],
            platforms: ['PC', 'Web'],
            tags: ['Single Player', 'AAA']
        },
        'Survival Island': {
            genres: ['Survival', 'Action-Adventure'],
            controllers: ['Clavier/Souris'],
            platforms: ['PC', 'Web'],
            tags: ['Single Player', 'Indie']
        },
        'Space Odyssey': {
            genres: ['Action-Adventure', 'Simulation'],
            controllers: ['Clavier/Souris', 'Manette'],
            platforms: ['PC'],
            tags: ['Single Player', 'AAA']
        },
        'Fantasy Warriors': {
            genres: ['RPG', 'Action-Adventure'],
            controllers: ['Clavier/Souris', 'Manette'],
            platforms: ['PC'],
            tags: ['Single Player', 'Indie']
        },
        'Rhythm Beat': {
            genres: ['Rhythm'],
            controllers: ['Clavier/Souris', 'Tactile'],
            platforms: ['PC', 'Web', 'Mobile'],
            tags: ['Single Player', 'Casual']
        },
        'Rogue Dungeon': {
            genres: ['Roguelike', 'RPG'],
            controllers: ['Clavier/Souris'],
            platforms: ['PC', 'Web'],
            tags: ['Single Player', 'Indie']
        },
        'Simulator Pro': {
            genres: ['Simulation'],
            controllers: ['Clavier/Souris'],
            platforms: ['PC'],
            tags: ['Single Player', 'Casual']
        },
        'Cyber Heist': {
            genres: ['FPS', 'Action-Adventure'],
            controllers: ['Clavier/Souris', 'Manette'],
            platforms: ['PC'],
            tags: ['Single Player', 'AAA']
        },
        'Mystic Realm': {
            genres: ['RPG', 'Action-Adventure'],
            controllers: ['Clavier/Souris', 'Manette'],
            platforms: ['PC', 'Web'],
            tags: ['Single Player', 'Indie']
        },
        'Racing Legends': {
            genres: ['Simulation', 'Action-Adventure'],
            controllers: ['Clavier/Souris', 'Manette'],
            platforms: ['PC'],
            tags: ['Single Player', 'Multiplayer', 'Competitive']
        },
    };

    for (const gameData of gamesData) {
        const existing = await db.select().from(games).where(eq(games.title, gameData.title)).limit(1);
        if (existing.length === 0) {
            // Créer le jeu
            await db.insert(games).values(gameData);
            
            // Récupérer l'ID du jeu créé
            const [createdGame] = await db.select()
                .from(games)
                .where(eq(games.title, gameData.title))
                .limit(1);
            
            if (createdGame) {
                const gameId = createdGame.id;
                const relations = gameRelations[gameData.title] || {
                    genres: ['Action-Adventure'],
                    controllers: ['Clavier/Souris'],
                    platforms: ['PC'],
                    tags: ['Single Player']
                };
                
                // Ajouter les genres
                for (const genreName of relations.genres) {
                    const genre = allGenres.find(g => g.name === genreName);
                    if (genre) {
                        try {
                            await db.insert(gameGenres).values({ GameId: gameId, GenreId: genre.id });
                        } catch (e) {
                            // Ignorer les doublons
                        }
                    }
                }
                
                // Ajouter les contrôleurs
                for (const controllerName of relations.controllers) {
                    const controller = allControllers.find(c => c.name === controllerName);
                    if (controller) {
                        try {
                            await db.insert(gameControllers).values({ GameId: gameId, ControllerId: controller.id });
                        } catch (e) {
                            // Ignorer les doublons
                        }
                    }
                }
                
                // Ajouter les plateformes
                for (const platformName of relations.platforms) {
                    const platform = allPlatforms.find(p => p.name === platformName);
                    if (platform) {
                        try {
                            await db.insert(gamePlatforms).values({ GameId: gameId, PlatformId: platform.id });
                        } catch (e) {
                            // Ignorer les doublons
                        }
                    }
                }
                
                // Ajouter les tags
                for (const tagName of relations.tags) {
                    const tag = allTags.find(t => t.name === tagName);
                    if (tag) {
                        try {
                            await db.insert(gameTags).values({ GameId: gameId, TagId: tag.id });
                        } catch (e) {
                            // Ignorer les doublons
                        }
                    }
                }
                
                // Ajouter le jeu à la bibliothèque du développeur
                if (devUser[0]) {
                    try {
                        await db.insert(library).values({
                            GameId: gameId,
                            UserId: devUser[0].id,
                            addedAt: new Date(),
                        });
                    } catch (e) {
                        // Ignorer si déjà dans la bibliothèque
                    }
                }
                
                console.log(`  ✅ Jeu '${gameData.title}' créé avec relations`);
            }
        } else {
            console.log(`  ℹ️  Jeu '${gameData.title}' existe déjà`);
        }
    }
}

// ============================================
// FONCTION PRINCIPALE
// ============================================
async function initializeAll() {
    console.log('🚀 Début de l\'initialisation des données...\n');
    
    try {
        await initRoles();
        console.log('');
        await initStatuses();
        console.log('');
        await initLanguages();
        console.log('');
        await initControllers();
        console.log('');
        await initPlatforms();
        console.log('');
        await initGenres();
        console.log('');
        await initTags();
        console.log('');
        await initUsers();
        console.log('');
        await initGames();
        console.log('');
        
        console.log('✅ Initialisation terminée avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        throw error;
    }
}

// Exécuter le script si appelé directement
initializeAll()
    .then(() => {
        console.log('\n🎉 Toutes les données ont été initialisées !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erreur fatale:', error);
        process.exit(1);
    });

export { initializeAll };

