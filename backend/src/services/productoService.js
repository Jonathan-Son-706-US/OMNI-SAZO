const { sql, dbConfig } = require('../config/db.js');

async function obtenerProductosBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerProductos');
  return result.recordset;
}

async function crearProductoBD(nombreProducto, precioVentaBase, manejaLote, idMarca, idPresentacion, idCategoria) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('NombreProducto', sql.VarChar(150), nombreProducto.trim())
    .input('PrecioVentaBase', sql.Decimal(10, 2), parseFloat(precioVentaBase))
    .input('ManejaLote', sql.Bit, manejaLote ? 1 : 0)
    .input('IdMarca', sql.Int, idMarca ? parseInt(idMarca, 10) : null)
    .input('IdPresentacion', sql.Int, idPresentacion ? parseInt(idPresentacion, 10) : null)
    .input('IdCategoria', sql.Int, idCategoria ? parseInt(idCategoria, 10) : null)
    .execute('sp_CrearProducto');
  return result.recordset[0];
}

async function actualizarProductoBD(idProducto, nombreProducto, precioVentaBase, manejaLote, idMarca, idPresentacion, idCategoria) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdProducto', sql.Int, parseInt(idProducto, 10))
    .input('NombreProducto', sql.VarChar(150), nombreProducto.trim())
    .input('PrecioVentaBase', sql.Decimal(10, 2), parseFloat(precioVentaBase))
    .input('ManejaLote', sql.Bit, manejaLote ? 1 : 0)
    .input('IdMarca', sql.Int, idMarca ? parseInt(idMarca, 10) : null)
    .input('IdPresentacion', sql.Int, idPresentacion ? parseInt(idPresentacion, 10) : null)
    .input('IdCategoria', sql.Int, idCategoria ? parseInt(idCategoria, 10) : null)
    .execute('sp_ActualizarProducto');
  return result.recordset[0];
}

async function eliminarProductoBD(idProducto) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdProducto', sql.Int, parseInt(idProducto, 10))
    .execute('sp_EliminarProducto');
  return result.recordset[0];
}

module.exports = {
  obtenerProductosBD,
  crearProductoBD,
  actualizarProductoBD,
  eliminarProductoBD
};