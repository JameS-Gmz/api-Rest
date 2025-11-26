import jwt from 'jsonwebtoken';
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return res.sendStatus(401); // Non autorisé si pas de token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403); // Token non valide
        req.user = user; // Stocke l'utilisateur dans la requête
        next();
    });
};
export default authenticateToken;
