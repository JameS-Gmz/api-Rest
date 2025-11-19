import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './Models/schema.js';
// Configuration de connexion
const connection = mysql.createPool({
    host: 'localhost',
    user: 'playAdmin',
    password: 'playAdmin',
    database: 'PlayForge',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
// Créer l'instance Drizzle avec le schéma
export const db = drizzle(connection, { schema, mode: 'default' });
// Test de connexion
connection.getConnection()
    .then((conn) => {
    console.log('✅ Connecté à la BDD avec Drizzle ORM : PlayForge');
    conn.release();
})
    .catch((error) => {
    console.error('❌ Erreur de connexion à la BDD:', error);
});
export { connection };
