const { sql, dbConfig } = require('../config/db.js');

// @abner: obtener todos los medios de pago registrados
async function obtenerMediosPagoBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerMediosPago');
  return result.recordset;
}

// @abner: crear un nuevo medio de pago
async function crearMedioPagoBD(nombreMedioPago) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('NombreMedioPago', sql.VarChar(50), nombreMedioPago)
    .execute('sp_CrearMedioPago');
  return result.recordset[0];
}

// @abner: actualizar un medio de pago existente
async function actualizarMedioPagoBD(idMedioPago, nombreMedioPago) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdMedioPago', sql.Int, parseInt(idMedioPago, 10))
    .input('NombreMedioPago', sql.VarChar(50), nombreMedioPago)
    .execute('sp_ActualizarMedioPago');
  return result.recordset[0];
}

// @abner: eliminar un medio de pago
async function eliminarMedioPagoBD(idMedioPago) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdMedioPago', sql.Int, parseInt(idMedioPago, 10))
    .execute('sp_EliminarMedioPago');
  return result.recordset[0];
}

// @abner: registrar los pagos de una factura, viene un array de pagos en json
async function registrarPagosFacturaBD(idFactura, pagos) {
  const pool = await sql.connect(dbConfig);
  const jsonPagos = JSON.stringify(pagos);
  const result = await pool.request()
    .input('IdFactura', sql.Int, parseInt(idFactura, 10))
    .input('JsonPagos', sql.NVarChar(sql.MAX), jsonPagos)
    .execute('PROCEDUREMEDIOSDEPAGOS');
  return result.recordset[0];
}

// @abner: obtener los pagos que ya se registraron en una factura
async function obtenerPagosFacturaBD(idFactura) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdFactura', sql.Int, parseInt(idFactura, 10))
    .execute('sp_ObtenerPagosFactura');
  return result.recordset;
}

// @abner: obtener toda la info de una factura para poder imprimirla
// devuelve 3 recordsets: encabezado, detalle y pagos
async function obtenerFacturaImpresionBD(idFactura) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdFactura', sql.Int, parseInt(idFactura, 10))
    .execute('PROCEDUREIMPRESIONDEFACTURAS');
  return {
    encabezado: result.recordsets[0][0] || null,
    detalle: result.recordsets[1] || [],
    pagos: result.recordsets[2] || []
  };
}

// @abner: listar facturas para el historial
async function obtenerFacturasBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerFacturas');
  return result.recordset;
}

// @abner: crear la factura y los pagos de una vez
async function crearFacturaCompletaBD(idCliente, idUsuario, idCotizacion, montoTotal, detalles, pagos) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdCliente', sql.Int, parseInt(idCliente, 10))
    .input('IdUsuario', sql.Int, parseInt(idUsuario, 10))
    .input('IdCotizacion', sql.Int, idCotizacion ? parseInt(idCotizacion, 10) : null)
    .input('MontoTotal', sql.Decimal(10,2), parseFloat(montoTotal))
    .input('JsonDetalle', sql.NVarChar(sql.MAX), JSON.stringify(detalles))
    .input('JsonPagos', sql.NVarChar(sql.MAX), JSON.stringify(pagos))
    .execute('sp_CrearFacturaCompleta');
  return result.recordset[0];
}

module.exports = {
  obtenerMediosPagoBD,
  crearMedioPagoBD,
  actualizarMedioPagoBD,
  eliminarMedioPagoBD,
  registrarPagosFacturaBD,
  obtenerPagosFacturaBD,
  obtenerFacturaImpresionBD,
  obtenerFacturasBD,
  crearFacturaCompletaBD
};

