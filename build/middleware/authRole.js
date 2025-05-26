import jwt from 'jsonwebtoken';
// Clé secrète pour le JWT
export const secretKey = process.env.JWT_SECRET || 'defaultSecretKey';
if (!process.env.JWT_SECRET) {
    console.warn('ATTENTION : Utilisation d\'une clé secrète par défaut. Veuillez définir JWT_SECRET dans les variables d\'environnement pour la production.');
}
// Définition des rôles
export const ROLES = {
    guest: 'guest',
    user: 'user',
    developer: 'developer',
    admin: 'admin',
    superadmin: 'superadmin'
};
// Middleware pour vérifier le rôle de l'utilisateur
export const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        // Si pas de token, l'utilisateur est considéré comme un invité
        if (!authHeader) {
            req.user = { id: '', role: 'guest' };
            return next();
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            req.user = { id: '', role: 'guest' };
            return next();
        }
        try {
            const decoded = jwt.verify(token, secretKey);
            req.user = decoded;
            // Vérification du rôle uniquement si l'utilisateur est authentifié
            if (decoded.role && !allowedRoles.includes(decoded.role)) {
                return res.status(403).json({
                    message: `Accès interdit, rôle '${decoded.role}' insuffisant. Rôle requis: ${allowedRoles.join(', ')}`
                });
            }
            next();
        }
        catch (error) {
            // En cas d'erreur de token, l'utilisateur est considéré comme un invité
            req.user = { id: '', role: 'guest' };
            next();
        }
    };
};
// Middleware pour vérifier uniquement le token sans le rôle
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token d\'authentification manquant' });
    }
    const tokenValue = authHeader.split(' ')[1];
    if (!tokenValue) {
        return res.status(401).json({ message: 'Format de token invalide' });
    }
    try {
        const decoded = jwt.verify(tokenValue, secretKey);
        // S'assurer que l'ID utilisateur est disponible dans req.user
        req.user = {
            id: decoded.userId || decoded.id,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        console.error('Erreur de vérification du token:', error);
        return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
};
