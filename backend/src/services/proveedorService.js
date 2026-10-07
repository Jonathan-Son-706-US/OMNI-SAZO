const { sql, dbConfig } = require('../config/db.js');

async function obtenerProveedoresBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerProveedores');
  return result.recordset;
}

async function crearProveedorBD(nombreProveedor, nit, telefono) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('NombreProveedor', sql.VarChar(150), nombreProveedor)
    .input('Nit', sql.VarChar(20), nit || 'CF')
    .input('Telefono', sql.VarChar(20), telefono || null)
    .execute('sp_CrearProveedor');
  return result.recordset[0];
}

async function actualizarProveedorBD(idProveedor, nombreProveedor, nit, telefono) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdProveedor', sql.Int, parseInt(idProveedor, 10))
    .input('NombreProveedor', sql.VarChar(150), nombreProveedor)
    .input('Nit', sql.VarChar(20), nit || 'CF')
    .input('Telefono', sql.VarChar(20), telefono || null)
    .execute('sp_ActualizarProveedor');
  return result.recordset[0];
}

async function eliminarProveedorBD(idProveedor) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdProveedor', sql.Int, parseInt(idProveedor, 10))
    .execute('sp_EliminarProveedor');
  return result.recordset[0];
}

module.exports = {
  obtenerProveedoresBD,
  crearProveedorBD,
  actualizarProveedorBD,
  eliminarProveedorBD
};