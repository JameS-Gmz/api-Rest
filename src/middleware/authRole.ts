import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Clé secrète pour le JWT
export const secretKey = process.env.JWT_SECRET || 'defaultSecretKey';
if (!process.env.JWT_SECRET) {
  console.warn('ATTENTION : Utilisation d\'une clé secrète par défaut. Veuillez définir JWT_SECRET dans les variables d\'environnement pour la production.');
}

// Étendre l'interface Request pour ajouter la propriété 'user'
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;  // Tu peux ici spécifier le type précis de l'utilisateur
  }
}

// Middleware pour vérifier le rôle de l'utilisateur
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Accès refusé, token manquant' });
    }

    const token = authHeader.split(' ')[1];  // Extraction du token après "Bearer"
    if (!token) {
      return res.status(401).json({ message: 'Accès refusé, token manquant' });
    }

    try {
      const decoded = jwt.verify(token, secretKey) as { role: string, username: string };  // Vérification et décodage du token
      console.log('Decoded token:', decoded);  // Affiche les informations du token pour débogage
      req.user = decoded;  // Stocke les informations décodées dans la requête

      // Vérification du rôle
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ 
          message: `Accès interdit, rôle '${decoded.role}' insuffisant. Rôle requis: ${allowedRoles.join(', ')}` 
        });
      }

      next();
    } catch (error) {
      console.error('Erreur de validation du token:', error);
      res.status(401).json({ message: 'Token invalide ou expiré' });
    }
  };
};

// Middleware pour vérifier uniquement le token sans le rôle
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé, token manquant' });
  }

  const tokenValue = token.split(' ')[1];  // Récupérer le token après "Bearer"
  if (!tokenValue) {
    return res.status(401).json({ message: 'Accès non autorisé, token manquant' });
  }

  try {
    const decoded = jwt.verify(tokenValue, secretKey);  // Vérification du token
    req.user = decoded;  // Stocker les infos utilisateur dans 'req.user'
    next();  // Passer au middleware suivant
  } catch (error) {
    console.error('Erreur de validation du token:', error);
    return res.status(401).json({ message: 'Token invalide' });
  }
};
