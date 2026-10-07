const { 
  obtenerUsuariosBD, 
  registrarUsuarioBD, 
  actualizarUsuarioBD, 
  desactivarUsuarioBD 
} = require('../services/userService');

// 1. list para @ambrocio
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await obtenerUsuariosBD();
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error al consultar usuarios', error: error.message });
  }
};

// creacionUser desde modulo
const createUsuario = async (req, res) => {
  const { nombreUsuario, contrasena, idRol } = req.body;

  if (!nombreUsuario || !contrasena || !idRol) { 
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  try {
    const data = await registrarUsuarioBD(nombreUsuario, contrasena, idRol);
    if (data && (data.Creado === 1 || data.Exito === 1)) {
      res.status(201).json({ ok: true, mensaje: data.Mensaje || 'Usuario creado exitosamente' });
    } else {
      res.status(400).json({ ok: false, mensaje: data ? data.Mensaje : 'Error al registrar usuario' });
    }
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 3. @update usuario en modulo
const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombreUsuario, idRol, estado, contrasena } = req.body;

  try {
    const data = await actualizarUsuarioBD(id, nombreUsuario, idRol, estado, contrasena);
    res.json({ ok: true, mensaje: data.Mensaje });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar usuario', error: error.message });
  }
};

// 4. Desactivar usuario mediante 1 y 0 segun PFBD2 db
const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await desactivarUsuarioBD(id);
    res.json({ ok: true, mensaje: data.Mensaje });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al desactivar usuario', error: error.message });
  }
};

module.exports = {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario
};