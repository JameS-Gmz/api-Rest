import multer from 'multer';
const storage = multer.memoryStorage(); // Utilise la mémoire pour stocker les fichiers temporairement
export const upload = multer({ storage: storage });
