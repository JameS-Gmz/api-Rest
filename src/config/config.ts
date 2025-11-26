import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage(); // Utilise la mémoire pour stocker les fichiers temporairement

export const upload = multer({ storage: storage });