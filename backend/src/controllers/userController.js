const { sql, dbConfig } = require('../config/db');
const { registrarUsuarioBD } = require('../services/userService');

// 1. Obtener todos los usuarios
const getUsuarios = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        u.IdUsuario,
        u.NombreUsuario,
        u.IdRol,
        r.NombreRol,    
        u.Estado
      FROM dbo.USUARIOS u
      LEFT JOIN dbo.ROLES r ON u.IdRol = r.IdRol
    `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error al consultar usuarios', error: error.message });
  }
};

// 2. Crear un nuevo usuario 
const createUsuario = async (req, res) => {
  const { nombreUsuario, contrasena, idRol } = req.body;

  if (!nombreUsuario || !contrasena || !idRol) { 
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  try {
    // Llamamos a la función del servicio
    const data = await registrarUsuarioBD(nombreUsuario, contrasena, idRol);

    if (data.Creado === 1) {
      res.status(201).json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombreUsuario, idRol, estado, contrasena } = req.body;

  const parsedIdUsuario = parseInt(id, 10);
  const parsedIdRol = parseInt(idRol, 10);

  if (isNaN(parsedIdUsuario) || isNaN(parsedIdRol) || !nombreUsuario) {
    return res.status(400).json({ 
      mensaje: 'El ID de usuario, Nombre y Rol son obligatorios.' 
    });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request()
      .input('idUsuario', sql.Int, parsedIdUsuario)
      .input('nombreUsuario', sql.VarChar(50), nombreUsuario)
      .input('idRol', sql.Int, parsedIdRol)
      .input('estado', sql.Bit, estado ? 1 : 0);

    if (contrasena && contrasena.trim() !== '') {
      request.input('contrasena', sql.VarChar(100), contrasena);
      await request.query(`
        DECLARE @NuevoSalt VARBINARY(32) = CRYPT_GEN_RANDOM(32);
        UPDATE dbo.USUARIOS 
        SET 
          NombreUsuario = @nombreUsuario,
          IdRol = @idRol,
          Estado = @estado,
          Salt = @NuevoSalt,
          PasswordHash = HASHBYTES('SHA2_512', CAST(@contrasena AS VARBINARY(100)) + @NuevoSalt)
        WHERE IdUsuario = @idUsuario
      `);
    } else {
      await request.query(`
        UPDATE dbo.USUARIOS 
        SET 
          NombreUsuario = @nombreUsuario,
          IdRol = @idRol,
          Estado = @estado
        WHERE IdUsuario = @idUsuario
      `);
    }

    res.json({ ok: true, mensaje: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
};

// 4. Cambiar estado de usuario (logico 1 o 0)
const deleteUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('id_usuario', sql.Int, parseInt(id, 10))
      .query('UPDATE dbo.USUARIOS SET Estado = 0 WHERE IdUsuario = @id_usuario');

    res.json({ ok: true, mensaje: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ mensaje: 'Error al desactivar el usuario', error: error.message });
  }
};

module.exports = {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario
};