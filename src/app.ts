import cors from "cors";
import express from "express";
import { userRoutes } from './routes/user.routes.js';
import { gameRoutes } from './routes/game.routes.js';
import { categoryRoutes } from './routes/category.routes.js';
import { commentRoutes } from './routes/comment.routes.js';

const app = express();
app.use(express.json());

// CORS configuration
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(cors({
    origin: 'http://localhost:4200',
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  credentials: true
}));

// API Routes
app.use('/user', userRoutes);
app.use('/game', gameRoutes);
app.use('/comment', commentRoutes);
// Routes de catégories (montées à la racine car elles ont leurs propres préfixes)
app.use('/', categoryRoutes);

// Initialize database and start server
app.listen(9090, () => {
    console.log("✅ Server running on port 9090");
    console.log("✅ Routes Drizzle activées");
});