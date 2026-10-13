const { sql, dbConfig } = require('../config/db.js');

// @abner: crear una nueva cotización
exports.crearCotizacionBD = async (idCliente, detalle) => {
  const pool = await sql.connect(dbConfig);
  const jsonDetalle = typeof detalle === 'string' ? detalle : JSON.stringify(detalle);

  const result = await pool.request()
    .input('IdCliente', sql.Int, parseInt(idCliente, 10))
    .input('JsonDetalle', sql.NVarChar(sql.MAX), jsonDetalle)
    .execute('sp_CrearCotizacion');

  return result.recordset ? result.recordset[0] : null;
};

// @abner: obtener listado de cotizaciones
exports.obtenerCotizacionesBD = async () => {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ObtenerCotizaciones');
  return result.recordset || [];
};

// @abner: obtener detalle de una cotizacion especifica
exports.obtenerCotizacionDetalleBD = async (idCotizacion) => {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdCotizacion', sql.Int, parseInt(idCotizacion, 10))
    .execute('sp_ObtenerCotizacionDetalle');
  
  return {
    encabezado: (result.recordsets && result.recordsets[0] && result.recordsets[0][0]) ? result.recordsets[0][0] : null,
    detalle: (result.recordsets && result.recordsets[1]) ? result.recordsets[1] : []
  };
};

// @abner: confirmar una cotizacion
exports.confirmarCotizacionBD = async (idCotizacion) => {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdCotizacion', sql.Int, parseInt(idCotizacion, 10))
    .execute('sp_ConfirmarCotizacion');
  
  return result.recordset ? result.recordset[0] : null;
};