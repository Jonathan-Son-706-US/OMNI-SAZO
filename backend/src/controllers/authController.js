const { validarLoginBD } = require('../services/authService.js');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'llave_secreta_omni_sazo';

//@jonas funcion para logueo posteriormente usada para el fronted
async function login(req, res) {
  const { usuario, password } = req.body;
  try {
    const data = await validarLoginBD(usuario, password);
    if (data.Autenticado === 1) {
      const token = jwt.sign(
        { 
          usuario: data.NombreUsuario, 
          rol: data.NombreRol, 
          idRol: data.IdRol 
        }, 
        SECRET_KEY, 
        { expiresIn: '8h' }
      );

      res.json({ 
        ok: true, 
        token, 
        usuario: data.NombreUsuario, 
        rol: data.NombreRol, 
        idRol: data.IdRol 
      });
    } else {
      res.status(401).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

module.exports = { login };