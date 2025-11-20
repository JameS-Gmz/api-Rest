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
        // Si pas de token, accès refusé pour les routes protégées
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Token d\'authentification manquant'
            });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                message: 'Format de token invalide'
            });
        }
        try {
            const decoded = jwt.verify(token, secretKey);
            // Extraire l'ID utilisateur (peut être userId ou id)
            const userId = decoded.userId || decoded.id || '';
            const userRole = decoded.role;
            // Log pour débogage
            console.log(`🔐 [authorizeRole] Utilisateur: ${userId}, Rôle: ${userRole}, Routes autorisées: ${allowedRoles.join(', ')}`);
            // Définir req.user avec les bonnes propriétés
            req.user = {
                id: userId.toString(),
                role: userRole
            };
            // Le superadmin a accès à toutes les routes
            if (userRole === 'superadmin') {
                console.log(`✅ [authorizeRole] Superadmin détecté - accès accordé à toutes les routes`);
                return next();
            }
            // Vérification du rôle uniquement si l'utilisateur est authentifié
            if (userRole && !allowedRoles.includes(userRole)) {
                console.log(`❌ [authorizeRole] Accès refusé: rôle '${userRole}' non autorisé`);
                return res.status(403).json({
                    message: `Accès interdit, rôle '${userRole}' insuffisant. Rôle requis: ${allowedRoles.join(', ')}`
                });
            }
            console.log(`✅ [authorizeRole] Accès accordé pour le rôle: ${userRole}`);
            next();
        }
        catch (error) {
            console.error('Erreur de vérification du token:', error);
            return res.status(401).json({
                message: 'Token invalide ou expiré'
            });
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
