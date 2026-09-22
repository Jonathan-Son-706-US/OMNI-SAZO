const { sql, dbConfig } = require('../config/db.js');

async function registrarUsuarioBD(nombreUsuario, password, idRol) {
  let pool = await sql.connect(dbConfig);
  let result = await pool.request()
    .input('IdRol', sql.Int, parseInt(idRol, 10))
    .input('NombreUsuario', sql.VarChar(50), nombreUsuario)
    .input('PasswordOriginal', sql.VarChar(100), password)
    .execute('sp_RegistrarUsuario');
  
  return result.recordset[0];
}

module.exports = { registrarUsuarioBD };