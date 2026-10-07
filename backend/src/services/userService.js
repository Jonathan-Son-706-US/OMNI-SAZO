const { sql, dbConfig } = require('../config/db.js');

async function obtenerUsuariosBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerUsuarios');
  return result.recordset;
}

async function registrarUsuarioBD(nombreUsuario, password, idRol) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdRol', sql.Int, parseInt(idRol, 10))
    .input('NombreUsuario', sql.VarChar(50), nombreUsuario)
    .input('PasswordOriginal', sql.VarChar(100), password)
    .execute('sp_RegistrarUsuario');
  
  return result.recordset[0];
}

async function actualizarUsuarioBD(idUsuario, nombreUsuario, idRol, estado, password) {
  const pool = await sql.connect(dbConfig);
  const request = pool.request()
    .input('IdUsuario', sql.Int, parseInt(idUsuario, 10))
    .input('NombreUsuario', sql.VarChar(50), nombreUsuario)
    .input('IdRol', sql.Int, parseInt(idRol, 10))
    .input('Estado', sql.Bit, estado ? 1 : 0);

  if (password && password.trim() !== '') {
    request.input('PasswordOriginal', sql.VarChar(100), password);
  }

  const result = await request.execute('sp_ActualizarUsuario');
  return result.recordset[0];
}

async function desactivarUsuarioBD(idUsuario) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdUsuario', sql.Int, parseInt(idUsuario, 10))
    .execute('sp_DesactivarUsuario');
  
  return result.recordset[0];
}

module.exports = {
  obtenerUsuariosBD,
  registrarUsuarioBD,
  actualizarUsuarioBD,
  desactivarUsuarioBD
};