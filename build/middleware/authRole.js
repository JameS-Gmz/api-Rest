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
    const token = req.headers['authorization'];
    if (!token) {
        req.user = { id: '', role: 'guest' };
        return next();
    }
    const tokenValue = token.split(' ')[1];
    if (!tokenValue) {
        req.user = { id: '', role: 'guest' };
        return next();
    }
    try {
        const decoded = jwt.verify(tokenValue, secretKey);
        req.user = decoded;
        next();
    }
    catch (error) {
        req.user = { id: '', role: 'guest' };
        next();
    }
};
