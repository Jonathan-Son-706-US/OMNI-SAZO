const { sql, dbConfig } = require('../config/db.js');

// 1. kpis para el dashboard
async function obtenerKPIsBD({ fechaInicio, fechaFin }) {
  const pool = await sql.connect(dbConfig);
  const request = pool.request();
  
  if (fechaInicio) request.input('FechaInicio', sql.Date, fechaInicio);
  if (fechaFin) request.input('FechaFin', sql.Date, fechaFin);

  const result = await request.execute('sp_ReporteKPIsGerencia');
  return (result.recordset && result.recordset[0]) ? result.recordset[0] : {
    TotalVentas: 0,
    FacturasEmitidas: 0,
    FacturasAnuladas: 0,
    TotalClientes: 0,
    ProductosCriticos: 0
  };
}

// 2. ingresos por medio de pago
async function obtenerIngresosMediosPagoBD({ fechaInicio, fechaFin }) {
  const pool = await sql.connect(dbConfig);
  const request = pool.request();

  if (fechaInicio) request.input('FechaInicio', sql.Date, fechaInicio);
  if (fechaFin) request.input('FechaFin', sql.Date, fechaFin);

  const result = await request.execute('sp_ReporteIngresosMedioPago');
  return result.recordset || [];
}

// 3. Reporte de rotación de productos (más y menos vendidos)
async function obtenerRotacionProductosBD({ fechaInicio, fechaFin }) {
  const pool = await sql.connect(dbConfig);
  const request = pool.request();

  if (fechaInicio) request.input('FechaInicio', sql.Date, fechaInicio);
  if (fechaFin) request.input('FechaFin', sql.Date, fechaFin);

  const result = await request.execute('sp_ReporteRotacionProductos');
  return result.recordset || [];
}

// 4. Reporte de inventario crítico / semáforo de existencias
async function obtenerStockCriticoBD() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().execute('sp_ReporteStockCritico');
  return result.recordset || [];
}

// 5. ventas por cajero
async function obtenerVentasCajerosBD({ fechaInicio, fechaFin }) {
  const pool = await sql.connect(dbConfig);
  const request = pool.request();

  if (fechaInicio) request.input('FechaInicio', sql.Date, fechaInicio);
  if (fechaFin) request.input('FechaFin', sql.Date, fechaFin);

  const result = await request.execute('sp_ReporteVentasPorCajero');
  return result.recordset || [];
}

module.exports = {
  obtenerKPIsBD,
  obtenerIngresosMediosPagoBD,
  obtenerRotacionProductosBD,
  obtenerStockCriticoBD,
  obtenerVentasCajerosBD
};
