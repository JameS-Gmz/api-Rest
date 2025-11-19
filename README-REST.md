# Boutique API - Image Integration Guide

## Overview

The Boutique API (port **9090**) manages game data, users, categories, and comments using **Drizzle ORM** with MySQL. While the API handles game metadata, **images are stored and served by the separate Upload API** (port 9091). This separation ensures efficient file handling and scalable architecture.

### Key Features

- **Game Management**: Create, read, update, and delete games with full metadata
- **Category System**: Manage controllers, platforms, genres, tags, statuses, and languages
- **User System**: Authentication, authorization, and user library management
- **Comment System**: Game ratings and comments with user association
- **Image Integration**: Retrieves image URLs from Upload API (port 9091)
- **Data Initialization**: Automated script to populate database with initial data

### Architecture

The system uses a **two-API architecture**:
- **Boutique API** (9090): Game data, business logic, Drizzle ORM
- **Upload API** (9091): File storage, image serving, file metadata

Images are referenced via URLs pointing to the Upload API, not stored directly in the boutique database.

---

## Installation Tutorial

### Prerequisites

- Node.js (v18+)
- MySQL database
- Upload API running on port 9091 (optional for image features)

### Step 1: Install Dependencies

```bash
cd api-boutique
npm install
```

### Step 2: Configure Database

Ensure your MySQL database credentials are configured in `src/database-drizzle.ts`:

```typescript
const connection = mysql.createPool({
  host: 'localhost',
  user: 'your_user',
  password: 'your_password',
  database: 'PlayForge'
});
```

### Step 3: Initialize Database

The database and tables are automatically created on first run. To initialize with sample data:

```bash
npm run init-data
```

This script creates:
- Roles (user, developer, admin, superadmin)
- Statuses, Languages, Controllers, Platforms
- Genres and Tags
- Sample users
- 10 sample games with relations

### Step 4: Start the Server

```bash
npm run dev
```

The server starts on **http://localhost:9090** and automatically:
- Creates database if missing
- Applies migrations
- Initializes data (if `init-data` script is configured)

---

## API Endpoints

### Game Routes

```http
POST /game/new
Authorization: Bearer <token>
Content-Type: application/json

Body: {
  "title": "Game Title",
  "description": "Game description",
  "price": "29.99",
  "authorStudio": "Studio Name",
  "madewith": "Unity",
  "StatusId": 1,
  "LanguageId": 1,
  "UserId": 1,
  "controllerIds": [1, 2],
  "platformIds": [1],
  "genreIds": [1, 2],
  "tagIds": [1]
}
```

```http
GET /game/AllGames
```

```http
GET /game/id/:gameId
```

```http
GET /game/last-updated
```

```http
GET /game/search?q=query
```

### Category Routes

```http
GET /data/:tableName
# Supports: controllers, platforms, statuses, languages, genres, tags, roles
```

```http
GET /controller/all
GET /platform/all
GET /status/all
GET /language/all
GET /genre/all
GET /tag/all
```

### User Routes

```http
POST /user/signup
POST /user/signin
GET /user/profile
GET /user/current-developer-id
GET /user/library/allgames
```

### Comment Routes

```http
GET /comment/game/:gameId
POST /comment/create
PUT /comment/update/:commentId
DELETE /comment/delete/:commentId
GET /comment/user/:userId
```

---

## Image Integration

### How It Works

1. **Game Creation**: Games are created with metadata (title, description, price, etc.)
2. **Image Upload**: Images are uploaded separately to Upload API (port 9091) with `gameId`
3. **Image Retrieval**: Frontend fetches images from Upload API using game ID

### Retrieving Game Images

Images are not stored in the boutique database. To get images for a game:

```javascript
// Get game data from boutique API
const game = await fetch('http://localhost:9090/game/id/1');

// Get images from upload API
const images = await fetch('http://localhost:9091/game/images/1');
const { files } = await images.json();
// files: [{ url: "http://localhost:9091/uploads/filename.png" }]
```

### Image Upload Flow

```javascript
// 1. Create game via boutique API
const gameResponse = await fetch('http://localhost:9090/game/new', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(gameData)
});
const { id: gameId } = await gameResponse.json();

// 2. Upload image via upload API
const formData = new FormData();
formData.append('file', imageFile);
formData.append('gameId', gameId);

await fetch('http://localhost:9091/game/upload/file', {
  method: 'POST',
  body: formData
});
```

---

## Code Examples

### Create Game with Categories

```javascript
const gameData = {
  title: "My Game",
  description: "Game description",
  price: "19.99",
  authorStudio: "My Studio",
  madewith: "Unity",
  StatusId: 1,
  LanguageId: 1,
  UserId: 1,
  controllerIds: [1, 2],
  platformIds: [1, 2],
  genreIds: [1, 3, 5],
  tagIds: [1, 2]
};

const response = await fetch('http://localhost:9090/game/new', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(gameData)
});
```

### Get All Games with Relations

```javascript
const response = await fetch('http://localhost:9090/game/AllGames');
const games = await response.json();

// Each game includes:
// - status, language, gameOwner
// - controllers[], platforms[], genres[], tags[]
```

### Search Games

```javascript
const response = await fetch('http://localhost:9090/game/search?q=adventure');
const results = await response.json();
```

### Get Category Data

```javascript
// Generic route
const controllers = await fetch('http://localhost:9090/data/controllers');
const platforms = await fetch('http://localhost:9090/data/platforms');

// Specific routes
const genres = await fetch('http://localhost:9090/genre/all');
const tags = await fetch('http://localhost:9090/tag/all');
```

---

## Data Initialization

### Automatic Initialization

The `init-data` script runs automatically with `npm run dev`:

```bash
npm run dev
# Runs: npm run init-data && tsx src/app.ts
```

### Manual Initialization

```bash
npm run init-data
```

### What Gets Initialized

- **4 Roles**: user, developer, admin, superadmin
- **5 Statuses**: Disponible, En développement, Bêta, Gratuit, Hors ligne
- **5 Languages**: Français, Anglais, Espagnol, Allemand, Italien
- **4 Controllers**: Clavier/Souris, Manette, Tactile, VR
- **4 Platforms**: PC, Web, Mobile, Console
- **20 Genres**: FPS, Survival, RPG, etc.
- **10 Tags**: Multiplayer, Single Player, Co-op, etc.
- **4 Users**: admin, dev1, user1, superadmin
- **10 Games**: With full category associations

---

## Database Schema

### Main Tables

- `Games`: Game metadata (title, description, price, madewith, etc.)
- `Users`: User accounts with role associations
- `Roles`: User roles (user, developer, admin, superadmin)
- `Statuses`: Game statuses
- `Languages`: Supported languages
- `Controllers`, `Platforms`, `Genres`, `Tags`: Category tables
- `Comment`: Game comments with ratings
- `Library`: User game library
- `Upload`: User-uploaded games tracking

### Join Tables

- `GameControllers`, `GamePlatforms`, `GameGenres`, `GameTags`: Many-to-many relations

---

## Troubleshooting

### Database Connection Error

- Verify MySQL is running
- Check credentials in `src/database-drizzle.ts`
- Ensure database `PlayForge` exists (created automatically)

### "Table doesn't exist" Error

- Run `npm run dev` to trigger automatic table creation
- Check migration files in `drizzle/` directory

### Images Not Displaying

- Ensure Upload API is running on port 9091
- Verify images were uploaded with correct `gameId`
- Check CORS configuration in Upload API

### Authentication Errors

- Verify JWT token is included in `Authorization` header
- Check token expiration (default: 2 hours)
- Ensure user role has required permissions

### Category Data Not Loading

- Verify `init-data` script ran successfully
- Check database for populated category tables
- Use `/data/:tableName` endpoint for generic access

---

## Development Commands

```bash
# Start development server (with auto-init)
npm run dev

# Initialize data only
npm run init-data

# Build TypeScript
npm run build

# Check game relations (debug)
npm run check-relations

# Watch mode
npm run watch
```

---

## File Structure

```
api-boutique/
├── src/
│   ├── app.ts                 # Main server file
│   ├── database-drizzle.ts    # Database connection & migrations
│   ├── Models/
│   │   └── schema.ts         # Drizzle schema definitions
│   ├── routes/
│   │   ├── game.routes.ts     # Game CRUD operations
│   │   ├── user.routes.ts     # User & auth routes
│   │   ├── category.routes.ts # Category endpoints
│   │   └── comment.routes.ts  # Comment & rating routes
│   ├── middleware/
│   │   └── authRole.ts       # JWT & role authorization
│   └── scripts/
│       ├── init-data.ts       # Data initialization script
│       └── check-relations.ts # Debug relations
├── drizzle/
│   ├── 0000_closed_phantom_reporter.sql
│   └── 0001_add_rating_to_comment.sql
└── package.json
```

---

## Integration with Upload API

### Required Setup

1. **Start Upload API**:
   ```bash
   cd api-upload
   npm start
   ```

2. **Upload Images**:
   ```bash
   cd api-upload
   npm run upload-assets
   ```

3. **Boutique API** automatically validates game existence when images are uploaded

### Image URL Format

Images are served at:
```
http://localhost:9091/uploads/:filename
```

Retrieved via:
```
http://localhost:9091/game/images/:gameId
```

---

## Notes

- The API uses **Drizzle ORM** (not Sequelize) for all database operations
- Database and tables are created automatically on first run
- Migrations are applied automatically from `drizzle/` directory
- JWT tokens expire after 2 hours (configurable)
- Superadmin role has access to all protected routes
- All game relations (categories) are stored in join tables
