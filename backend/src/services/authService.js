const { sql, dbConfig } = require('../config/db.js');
//@jonas esto es para llamar al procedure de validacion que esta en SQL-Management 
//pd: el script lo deje en db/scripts para el codigo .sql con nuestras tablas no se modifico nada 
async function validarLoginBD(usuario, password) {
  let pool = await sql.connect(dbConfig);
  let result = await pool.request()
    .input('NombreUsuario', sql.VarChar(50), usuario)
    .input('PasswordClon', sql.VarChar(100), password)
    .execute('sp_ValidarLogin');
  
  return result.recordset[0];
}

module.exports = { validarLoginBD };