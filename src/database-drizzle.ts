// import { drizzle } from 'drizzle-orm/mysql2';
// import mysql from 'mysql2/promise';
// import * as schema from './Models/schema.js';

// const DB_CONFIG = {
//     host: 'localhost',
//     user: 'playAdmin',
//     password: 'playAdmin',
//     database: 'PlayForge',
// };

// /**
//  * Créer la base de données si elle n'existe pas
//  */
// async function ensureDatabaseExists() {
//     // Se connecter sans spécifier de base de données
//     const adminConnection = await mysql.createConnection({
//         host: DB_CONFIG.host,
//         user: DB_CONFIG.user,
//         password: DB_CONFIG.password,
//     });

//     try {
//         // Vérifier si la base de données existe
//         const [databases] = await adminConnection.execute<mysql.RowDataPacket[]>(
//             `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
//             [DB_CONFIG.database]
//         );

//         if (databases.length === 0) {
//             // Créer la base de données
//             await adminConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
//             console.log(`✅ Base de données '${DB_CONFIG.database}' créée avec succès`);
//         } else {
//             console.log(`✅ Base de données '${DB_CONFIG.database}' existe déjà`);
//         }
//     } catch (error) {
//         console.error('❌ Erreur lors de la vérification/création de la base de données:', error);
//         throw error;
//     } finally {
//         await adminConnection.end();
//     }
// }

// /**
//  * Appliquer les migrations SQL pour créer les tables
//  */
// async function applyMigrations() {
//     const dbConnection = await mysql.createConnection({
//         host: DB_CONFIG.host,
//         user: DB_CONFIG.user,
//         password: DB_CONFIG.password,
//         database: DB_CONFIG.database,
//         multipleStatements: true,
//     });

//     try {
//         // Lire le fichier de migration
//         const fs = await import('fs/promises');
//         const path = await import('path');
//         const migrationPath = path.join(process.cwd(), 'drizzle', '0000_closed_phantom_reporter.sql');
        
//         try {
//             const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
            
//             // Séparer les statements par '--> statement-breakpoint'
//             const parts = migrationSQL.split('--> statement-breakpoint');
//             const statements: string[] = [];
            
//             for (const part of parts) {
//                 let statement = part.trim();
//                 if (!statement) continue;
                
//                 // Nettoyer les commentaires (lignes qui commencent par --)
//                 statement = statement
//                     .split('\n')
//                     .filter(line => {
//                         const trimmed = line.trim();
//                         // Garder les lignes non-vides qui ne sont pas des commentaires purs
//                         return trimmed && !trimmed.startsWith('--');
//                     })
//                     .join('\n')
//                     .trim();
                
//                 if (statement && statement.toUpperCase().includes('CREATE TABLE')) {
//                     statements.push(statement);
//                 }
//             }

//             // Exécuter chaque statement
//             let tablesCreated = 0;
//             for (const statement of statements) {
//                 try {
//                     await dbConnection.execute(statement);
//                     const tableName = statement.match(/CREATE TABLE `?(\w+)`?/i)?.[1];
//                     if (tableName) {
//                         tablesCreated++;
//                         console.log(`  ✅ Table '${tableName}' créée`);
//                     }
//                 } catch (error: any) {
//                     // Ignorer les erreurs "table already exists" ou "duplicate key"
//                     if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
//                         error.code === 'ER_DUP_KEYNAME' ||
//                         error.message?.includes('already exists') ||
//                         error.message?.includes('Duplicate key name')) {
//                         // Table existe déjà, c'est OK
//                         const tableName = statement.match(/CREATE TABLE `?(\w+)`?/i)?.[1];
//                         if (tableName) {
//                             console.log(`  ℹ️  Table '${tableName}' existe déjà`);
//                         }
//                     } else {
//                         console.warn(`⚠️  Erreur lors de la création d'une table:`, error.message || error);
//                     }
//                 }
//             }
            
//             if (tablesCreated > 0) {
//                 console.log(`✅ ${tablesCreated} table(s) créée(s) avec succès`);
//             } else {
//                 console.log('✅ Toutes les tables existent déjà');
//             }
//         } catch (fileError: any) {
//             if (fileError.code === 'ENOENT') {
//                 console.log('⚠️  Fichier de migration non trouvé, utilisation de drizzle-kit push...');
//                 // Si le fichier n'existe pas, on laisse drizzle-kit push s'en charger
//             } else {
//                 throw fileError;
//             }
//         }
        
//         // Appliquer la migration pour ajouter le champ rating à Comment (toujours, même si les tables existent)
//         try {
//             const migrationPath2 = path.join(process.cwd(), 'drizzle', '0001_add_rating_to_comment.sql');
//             console.log('📋 Tentative d\'application de la migration 0001...');
//             const migrationSQL2 = await fs.readFile(migrationPath2, 'utf-8');
            
//             // Nettoyer le SQL : retirer les commentaires et les lignes vides
//             const cleanedSQL = migrationSQL2
//                 .split('\n')
//                 .filter(line => {
//                     const trimmed = line.trim();
//                     return trimmed && !trimmed.startsWith('--');
//                 })
//                 .join(' ')
//                 .trim();
            
//             // Extraire les statements SQL (séparés par ;)
//             const statements2 = cleanedSQL.split(';')
//                 .map(s => s.trim())
//                 .filter(s => s.length > 0);
            
//             for (const statement of statements2) {
//                 if (statement) {
//                     try {
//                         console.log(`  🔄 Exécution: ${statement.substring(0, 50)}...`);
//                         await dbConnection.execute(statement);
//                         console.log('  ✅ Migration 0001 appliquée: champ rating ajouté à Comment');
//                     } catch (error: any) {
//                         // Ignorer les erreurs "duplicate column" ou "column already exists"
//                         if (error.code === 'ER_DUP_FIELDNAME' || 
//                             error.code === 1060 ||
//                             error.message?.includes('Duplicate column name') ||
//                             error.message?.includes('already exists') ||
//                             error.sqlMessage?.includes('Duplicate column name')) {
//                             console.log('  ℹ️  Champ rating existe déjà dans Comment');
//                         } else {
//                             console.error(`  ❌ Erreur lors de l'application de la migration 0001:`, error.message || error);
//                             console.error(`  Code d'erreur: ${error.code}, SQL: ${error.sql || statement}`);
//                         }
//                     }
//                 }
//             }
//         } catch (fileError2: any) {
//             if (fileError2.code === 'ENOENT') {
//                 console.warn('  ⚠️  Fichier de migration 0001 non trouvé, tentative d\'ajout direct de la colonne...');
//                 // Essayer d'ajouter la colonne directement
//                 try {
//                     await dbConnection.execute('ALTER TABLE `Comment` ADD COLUMN `rating` int NULL AFTER `content`');
//                     console.log('  ✅ Colonne rating ajoutée directement à Comment');
//                 } catch (directError: any) {
//                     if (directError.code === 'ER_DUP_FIELDNAME' || directError.code === 1060) {
//                         console.log('  ℹ️  Colonne rating existe déjà dans Comment');
//                     } else {
//                         console.error('  ❌ Erreur lors de l\'ajout direct de la colonne:', directError.message);
//                     }
//                 }
//             } else {
//                 console.error('  ❌ Erreur lors de la lecture de la migration 0001:', fileError2.message);
//             }
//         }
//     } catch (error) {
//         console.error('❌ Erreur lors de l\'application des migrations:', error);
//         // Ne pas bloquer le démarrage, les tables peuvent être créées manuellement
//     } finally {
//         await dbConnection.end();
//     }
// }

// // Créer la base de données si nécessaire
// await ensureDatabaseExists();

// // Appliquer les migrations pour créer les tables
// await applyMigrations();

// // Configuration de connexion avec la base de données
// const connection = mysql.createPool({
//     host: DB_CONFIG.host,
//     user: DB_CONFIG.user,
//     password: DB_CONFIG.password,
//     database: DB_CONFIG.database,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
// });

// // Créer l'instance Drizzle avec le schéma
// export const db = drizzle(connection, { schema, mode: 'default' });

// // Test de connexion
// connection.getConnection()
//     .then((conn) => {
//         console.log(`✅ Connecté à la BDD avec Drizzle ORM : ${DB_CONFIG.database}`);
//         conn.release();
//     })
//     .catch((error: Error) => {
//         console.error('❌ Erreur de connexion à la BDD:', error);
//     });

// export { connection };


import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './Models/schema.js';

/** CONFIG : Compatible local + Render */
const DB_CONFIG = {
    host: process.env.DB_HOST!,  
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    port: Number(process.env.DB_PORT!) || 3306
};

/**
 * ❌ Removed ensureDatabaseExists() (Render interdit CREATE DATABASE)
 * Tu dois créer la base toi-même sur Render ou sur ton VPS.
 */


/**
 * Migrations : OK sur Render tant que les fichiers sont dans le repo
 */
async function applyMigrations() {
    const dbConnection = await mysql.createConnection({
        host: DB_CONFIG.host,
        user: DB_CONFIG.user,
        password: DB_CONFIG.password,
        database: DB_CONFIG.database,
        port: DB_CONFIG.port,
        multipleStatements: true,
    });

    try {
        const fs = await import('fs/promises');
        const path = await import('path');

        // MIGRATION 0000
        const migrationPath = path.join(process.cwd(), 'drizzle', '0000_closed_phantom_reporter.sql');

        try {
            const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
            const statements = migrationSQL
                .split('--> statement-breakpoint')
                .map(s => s.trim())
                .filter(s => s.includes('CREATE TABLE'));

            for (const statement of statements) {
                try {
                    await dbConnection.execute(statement);
                    console.log("  ✅ Table créée / déjà existante");
                } catch (e: any) {
                    if (!e.message.includes("exists")) {
                        console.warn("⚠️ Erreur lors de la migration:", e.message);
                    }
                }
            }

        } catch (e: any) {
            console.warn("⚠️ Fichier migration 0000 introuvable :", e.message);
        }

        // MIGRATION 0001
        try {
            const migrationPath2 = path.join(process.cwd(), 'drizzle', '0001_add_rating_to_comment.sql');
            const migrationText = await fs.readFile(migrationPath2, 'utf-8');

            const statements = migrationText
                .split(";")
                .map(s => s.trim())
                .filter(Boolean);

            for (const st of statements) {
                try {
                    await dbConnection.execute(st);
                    console.log("  ✅ Migration exécutée :", st.substring(0, 40));
                } catch (e: any) {
                    if (!e.message.includes("Duplicate column")) {
                        console.warn("⚠️ Migration 0001 erreur :", e.message);
                    }
                }
            }

        } catch (e: any) {
            console.warn("⚠️ Migration 0001 introuvable :", e.message);
        }

    } finally {
        await dbConnection.end();
    }
}

await applyMigrations();

/** Pool de connexion + Drizzle */
const connection = mysql.createPool({
    host: DB_CONFIG.host,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
    database: DB_CONFIG.database,
    port: DB_CONFIG.port,
    waitForConnections: true,
    connectionLimit: 10,
});

export const db = drizzle(connection, { schema, mode: 'default' });

connection.getConnection()
    .then(conn => {
        console.log(`✅ Connecté à MySQL (${DB_CONFIG.database})`);
        conn.release();
    })
    .catch(err => {
        console.error('❌ Erreur de connexion :', err);
    });

export { connection };
