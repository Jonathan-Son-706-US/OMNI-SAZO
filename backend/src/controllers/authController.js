const { validarLoginBD } = require('../services/authService.js');
//@jonas funcion para logueo posteriormente usada para el fronted
async function login(req, res) {
  const { usuario, password } = req.body;
  try {
    const data = await validarLoginBD(usuario, password);
    if (data.Autenticado === 1) {
      res.json({ ok: true, usuario: data.NombreUsuario, rol: data.NombreRol, idRol: data.IdRol });
    } else {
      res.status(401).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

module.exports = { login };