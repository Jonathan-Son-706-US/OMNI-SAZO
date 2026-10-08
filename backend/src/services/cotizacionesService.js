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