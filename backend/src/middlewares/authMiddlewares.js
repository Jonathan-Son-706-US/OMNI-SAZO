const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'llave_secreta_omni_sazo';

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
        return res.status(403).json({ ok: false, mensaje: 'Token inválido o expirado.' });
    }
}

function esGerente(req, res, next) {
    if (req.usuario && req.usuario.idRol === 3) { // 3 = Gerente
        next();
    } else {
        return res.status(403).json({ ok: false, mensaje: 'Acceso restringido. Requiere perfil de Gerente.' });
    }
}

module.exports = { verificarToken, esGerente };