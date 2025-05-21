const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const validarJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ msg: 'No hay token en la petición' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET || 'secreto');
        req.usuario = payload;
        next();
    } catch (error) {
        return res.status(401).json({ msg: 'Token inválido o expirado' });
    }
};

module.exports = validarJWT;
