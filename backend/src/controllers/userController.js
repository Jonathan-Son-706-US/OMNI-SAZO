const { sql, dbConfig } = require('../config/db');

// 1. Obtener todos los usuarios con su rol correspondiente
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

// 2. Crear un nuevo usuario (Corregido desestructuración)
const createUsuario = async (req, res) => {
  console.log('---> BODY RECIBIDO:', req.body); // Check de depuración

  // Se extraen las llaves exactas que manda UsuarioForm.jsx
  const { nombreUsuario, contrasena, idRol } = req.body;

  // Validación con las variables correctas
  if (!nombreUsuario || !contrasena || !idRol) { 
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    
    await pool.request()
      .input('nombreUsuario', sql.VarChar(50), nombreUsuario)
      .input('contrasena', sql.VarChar(100), contrasena)
      .input('idRol', sql.Int, parseInt(idRol, 10))
      .query(`
        INSERT INTO dbo.USUARIOS (NombreUsuario, PasswordHash, Salt, IdRol, Estado)
        VALUES (
          @nombreUsuario, 
          HASHBYTES('SHA2_256', @contrasena), 
          CAST('' AS VARBINARY(32)), 
          @idRol, 
          1
        )
      `);

    res.status(201).json({ ok: true, mensaje: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: 'Error al guardar el usuario', error: error.message });
  }
};

// 3. Actualizar un usuario existente (Corregida la columna PasswordHash)
const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombreUsuario, idRol, estado, contrasena } = req.body;

  const parsedIdUsuario = parseInt(id, 10);
  const parsedIdRol = parseInt(idRol, 10);

  if (isNaN(parsedIdUsuario) || isNaN(parsedIdRol) || !nombreUsuario) {
    return res.status(400).json({ 
      mensaje: 'El ID de usuario, Nombre y Rol son obligatorios y deben ser válidos.' 
    });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request()
      .input('idUsuario', sql.Int, parsedIdUsuario)
      .input('nombreUsuario', sql.VarChar(50), nombreUsuario)
      .input('idRol', sql.Int, parsedIdRol)
      .input('estado', sql.Bit, estado ? 1 : 0);

    // Si se escribió una nueva contraseña, actualizamos el PasswordHash
    if (contrasena && contrasena.trim() !== '') {
      request.input('contrasena', sql.VarChar(100), contrasena);
      await request.query(`
        UPDATE dbo.USUARIOS 
        SET 
          NombreUsuario = @nombreUsuario,
          IdRol = @idRol,
          Estado = @estado,
          PasswordHash = HASHBYTES('SHA2_256', @contrasena)
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
    console.error('---> ERROR EXACTO EN BACKEND AL ACTUALIZAR USUARIO:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
};

// 4. Cambiar estado de usuario (Desactivar/Eliminado Lógico)
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