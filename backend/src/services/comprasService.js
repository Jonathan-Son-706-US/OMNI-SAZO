const { sql, dbConfig } = require('../config/db.js');

// @Javier: listar todas las ordenes de compra (historial)
async function obtenerOrdenesBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerOrdenesCompra');
  return result.recordset;
}

// @Javier: listar ordenes pendientes de recepcion
async function obtenerOrdenesPendientesBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerOrdenesPendientes');
  return result.recordset;
}

// @Javier: detalle completo de una orden (encabezado + detalle)
async function obtenerOrdenCompraDetalleBD(idOrdenCompra) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdOrdenCompra', sql.Int, parseInt(idOrdenCompra, 10))
    .execute('sp_ObtenerOrdenCompraDetalle');
  return {
    encabezado: (result.recordsets && result.recordsets[0] && result.recordsets[0][0]) ? result.recordsets[0][0] : null,
    detalle: (result.recordsets && result.recordsets[1]) ? result.recordsets[1] : []
  };
}

// @Javier: cargar detalle de la orden para el formulario de recepcion
async function obtenerRecepcionOrdenBD(idOrdenCompra) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdOrdenCompra', sql.Int, parseInt(idOrdenCompra, 10))
    .execute('sp_ObtenerRecepcionOrden');
  return result.recordset;
}

// @Javier: crear una orden de compra (encabezado + detalle)
async function crearOrdenCompraBD(idProveedor, detalles) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdProveedor', sql.Int, parseInt(idProveedor, 10))
    .input('JsonDetalle', sql.NVarChar(sql.MAX), JSON.stringify(detalles))
    .execute('sp_CrearOrdenCompra');
  return result.recordset[0];
}

// @Javier: actualizar una orden de compra solo si sigue PENDIENTE
async function actualizarOrdenCompraBD(idOrdenCompra, idProveedor, detalles) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdOrdenCompra', sql.Int, parseInt(idOrdenCompra, 10))
    .input('IdProveedor', sql.Int, parseInt(idProveedor, 10))
    .input('JsonDetalle', sql.NVarChar(sql.MAX), JSON.stringify(detalles))
    .execute('sp_ActualizarOrdenCompra');
  return result.recordset[0];
}

// @Javier: registrar recepcion total e ingreso a bodega (transaccion atomica)
async function registrarRecepcionBD(idOrdenCompra, idUsuario, items) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdOrdenCompra', sql.Int, parseInt(idOrdenCompra, 10))
    .input('IdUsuario', sql.Int, parseInt(idUsuario, 10))
    .input('JsonRecepcion', sql.NVarChar(sql.MAX), JSON.stringify(items))
    .execute('sp_RegistrarRecepcionCompra');
  return result.recordset[0];
}

module.exports = {
  obtenerOrdenesBD,
  obtenerOrdenesPendientesBD,
  obtenerOrdenCompraDetalleBD,
  obtenerRecepcionOrdenBD,
  crearOrdenCompraBD,
  actualizarOrdenCompraBD,
  registrarRecepcionBD
};
