const { sql, dbConfig } = require('../config/db.js');

// @Javi: crear una factura transaccional con descuento PEPS de inventario
async function crearFacturaPEPSBD({ idCliente, idCotizacion, idUsuario, detalle, mediosPago }) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdCliente', sql.Int, parseInt(idCliente, 10))
    .input('IdCotizacion', sql.Int, idCotizacion ? parseInt(idCotizacion, 10) : null)
    .input('IdUsuario', sql.Int, parseInt(idUsuario, 10))
    .input('DetalleProductosJson', sql.NVarChar(sql.MAX), JSON.stringify(detalle))
    .input('MediosPagoJson', sql.NVarChar(sql.MAX), JSON.stringify(mediosPago))
    .execute('sp_CrearFacturaPEPS');

  return (result.recordset && result.recordset[0]) ? result.recordset[0] : null;
}

// @Javi: stock disponible por producto (para habilitar/deshabilitar en el carrito)
async function obtenerStockDisponibleBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerStockDisponible');
  return result.recordset || [];
}

module.exports = {
  crearFacturaPEPSBD,
  obtenerStockDisponibleBD
};
