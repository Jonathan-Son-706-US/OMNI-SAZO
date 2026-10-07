const { sql, dbConfig } = require('../config/db.js');

async function obtenerClientesBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerClientes');
  return result.recordset;
}

async function crearClienteBD(nombre, nit, esEmpresa) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('Nombre', sql.VarChar(150), nombre)
    .input('Nit', sql.VarChar(20), nit || 'CF')
    .input('EsEmpresa', sql.Bit, esEmpresa ? 1 : 0)
    .execute('sp_CrearCliente');
  return result.recordset[0];
}

async function actualizarClienteBD(idCliente, nombre, nit, esEmpresa) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdCliente', sql.Int, parseInt(idCliente, 10))
    .input('Nombre', sql.VarChar(150), nombre)
    .input('Nit', sql.VarChar(20), nit || 'CF')
    .input('EsEmpresa', sql.Bit, esEmpresa ? 1 : 0)
    .execute('sp_ActualizarCliente');
  return result.recordset[0];
}

async function eliminarClienteBD(idCliente) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdCliente', sql.Int, parseInt(idCliente, 10))
    .execute('sp_EliminarCliente');
  return result.recordset[0];
}

module.exports = {
  obtenerClientesBD,
  crearClienteBD,
  actualizarClienteBD,
  eliminarClienteBD
};