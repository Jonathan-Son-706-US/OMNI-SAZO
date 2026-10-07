const { sql, dbConfig } = require('../config/db.js');

async function obtenerRolesBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerRoles');
  return result.recordset;
}

async function obtenerMarcasBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerMarcas');
  return result.recordset;
}

async function obtenerCategoriasBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerCategorias');
  return result.recordset;
}

async function obtenerPresentacionesBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerPresentaciones');
  return result.recordset;
}

module.exports = {
  obtenerRolesBD,
  obtenerMarcasBD,
  obtenerCategoriasBD,
  obtenerPresentacionesBD
};