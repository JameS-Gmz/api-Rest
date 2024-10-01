import jwt from 'jsonwebtoken';
export const secretKey = process.env.JWT_SECRET || 'defaultSecretKey';
if (!process.env.JWT_SECRET) {
    console.warn('ATTENTION : Utilisation d\'une clé secrète par défaut. Veuillez définir JWT_SECRET dans les variables d\'environnement pour la production.');
}
export const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Accès refusé, token manquant' });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecretKey');
            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Accès interdit, rôle insuffisant' });
            }
            next();
        }
        catch (error) {
            res.status(401).json({ message: 'Token invalide ou expiré' });
        }
    };
};
export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Accès non autorisé, token manquant' });
    }
    try {
        const decoded = jwt.verify(token.split(' ')[1], secretKey); // Vérification du token
        req.user = decoded; // Stocker les infos utilisateur dans 'req.user'
        next(); // Passer à la prochaine étape
    }
    catch (error) {
        return res.status(401).json({ message: 'Token invalide' });
    }
};
