const jwt = require('jsonwebtoken');
const { JWT_SECRET: SECRET_KEY } = require('../config/jwt');
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ ok: false, mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ ok: false, mensaje: 'Token invalido o expirado.' });
    }
}

function esGerente(req, res, next) {
    if (req.usuario && req.usuario.idRol === 3) {
        next();
    } else {
        return res.status(403).json({ ok: false, mensaje: 'Acceso restringido. Requiere perfil de Gerente.' });
    }
}

function esCajeroODigitador(req, res, next) {
    if (req.usuario && (req.usuario.idRol === 1 || req.usuario.idRol === 2)) {
        next();
    } else {
        return res.status(403).json({ ok: false, mensaje: 'Acceso restringido. Requiere perfil de Cajero o Digitador.' });
    }
}

function esCajeroOGerente(req, res, next) {
    // Permite Digitador (1), Cajero (2) y Gerente (3)
    if (req.usuario && [1, 2, 3].includes(req.usuario.idRol)) {
        next();
    } else {
        return res.status(403).json({ ok: false, mensaje: 'Acceso restringido.' });
    }
}

module.exports = { verificarToken, esGerente, esCajeroODigitador, esCajeroOGerente };
