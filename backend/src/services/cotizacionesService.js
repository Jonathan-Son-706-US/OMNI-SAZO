const sql = require('mssql');

exports.crearCotizacionBD = async (idCliente, detalle) => {
  const pool = await sql.connect();
  const jsonDetalle = JSON.stringify(detalle);

  const result = await pool.request()
    .input('IdCliente', sql.Int, idCliente)
    .input('JsonDetalle', sql.NVarChar(sql.MAX), jsonDetalle)
    .execute('sp_CrearCotizacion');

  return result.recordset[0];
};

// @abner: obtener listado de cotizaciones
exports.obtenerCotizacionesBD = async () => {
  const pool = await sql.connect();
  const result = await pool.request().execute('sp_ObtenerCotizaciones');
  return result.recordset;
};

// @abner: obtener detalle de una cotizacion especifica
exports.obtenerCotizacionDetalleBD = async (idCotizacion) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('IdCotizacion', sql.Int, parseInt(idCotizacion, 10))
    .execute('sp_ObtenerCotizacionDetalle');
  
  return {
    encabezado: result.recordsets[0][0] || null,
    detalle: result.recordsets[1] || []
  };
};

// @abner: confirmar una cotizacion
exports.confirmarCotizacionBD = async (idCotizacion) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('IdCotizacion', sql.Int, parseInt(idCotizacion, 10))
    .execute('sp_ConfirmarCotizacion');
  
  return result.recordset[0];
};