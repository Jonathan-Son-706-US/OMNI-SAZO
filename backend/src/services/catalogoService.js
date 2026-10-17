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

// @Javier: bodegas y ubicaciones para el modulo de compras/ingreso a bodega
async function obtenerBodegasBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerBodegas');
  return result.recordset;
}

async function obtenerUbicacionesBD(idBodega = null) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdBodega', sql.Int, idBodega ? parseInt(idBodega, 10) : null)
    .execute('sp_ObtenerUbicacionesBodega');
  return result.recordset;
}

module.exports = {
  obtenerRolesBD,
  obtenerMarcasBD,
  obtenerCategoriasBD,
  obtenerPresentacionesBD,
  obtenerBodegasBD,
  obtenerUbicacionesBD
};