// authMiddleware.js
import jwt from 'jsonwebtoken';
const secretKey = process.env.JWT_SECRET || 'defaultSecretKey';
export function authorize(roles = []) {
    // roles param can be a single role string (e.g., 'admin') or an array (e.g., ['admin', 'user'])
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Non autorisé' });
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, secretKey);
            // Check if the user's role is authorized
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Accès refusé' });
            }
            // Attach user information to request object
            req.user = decoded;
            next();
        }
        catch (error) {
            console.error('Erreur JWT:', error);
            return res.status(403).json({ message: 'Token invalide ou expiré' });
        }
    };
}
