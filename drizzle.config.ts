import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/Models/schema.ts',
    out: './drizzle',
    dbCredentials: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'PlayForge',
        port: Number(process.env.DB_PORT) || 5432,
    },
});

