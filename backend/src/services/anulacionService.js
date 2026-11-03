const { sql, dbConfig } = require('../config/db.js');

// Obtener datos de factura completa para evaluar su anulación
async function obtenerFacturaParaAnulacionBD(idFactura) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdFactura', sql.Int, parseInt(idFactura, 10))
    .execute('sp_ObtenerFacturaParaAnulacion');

  const encabezado = result.recordsets[0] ? result.recordsets[0][0] : null;
  const detalle = result.recordsets[1] || [];
  const pagos = result.recordsets[2] || [];
  const devolucion = result.recordsets[3] ? result.recordsets[3][0] : null;

  if (!encabezado) return null;

  return {
    encabezado,
    detalle,
    pagos,
    devolucion
  };
}

// Ejecutar procedimiento transaccional de anulación
async function anularFacturaBD({ idFactura, idUsuario, motivo }) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('IdFactura', sql.Int, parseInt(idFactura, 10))
    .input('IdUsuario', sql.Int, parseInt(idUsuario, 10))
    .input('Motivo', sql.VarChar(255), motivo.trim())
    .execute('sp_AnularFactura');

  return (result.recordset && result.recordset[0]) ? result.recordset[0] : null;
}

module.exports = {
  obtenerFacturaParaAnulacionBD,
  anularFacturaBD
};
