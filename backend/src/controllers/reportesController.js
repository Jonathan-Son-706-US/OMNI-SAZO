const {
  obtenerKPIsBD,
  obtenerIngresosMediosPagoBD,
  obtenerRotacionProductosBD,
  obtenerStockCriticoBD,
  obtenerVentasCajerosBD
} = require('../services/reportesService');

// validar rango de fechas
function extraerFechas(req) {
  const { fechaInicio, fechaFin } = req.query;
  return {
    fechaInicio: fechaInicio ? fechaInicio.trim() : null,
    fechaFin: fechaFin ? fechaFin.trim() : null
  };
}

// resumen de kpis
async function getKPIs(req, res) {
  try {
    const fechas = extraerFechas(req);
    const kpis = await obtenerKPIsBD(fechas);
    return res.status(200).json({ ok: true, data: kpis });
  } catch (error) {
    console.error('Error al obtener KPIs:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al consultar indicadores gerenciales.', error: error.message });
  }
}

// ingresos por medio de pago
async function getIngresosMediosPago(req, res) {
  try {
    const fechas = extraerFechas(req);
    const datos = await obtenerIngresosMediosPagoBD(fechas);
    return res.status(200).json({ ok: true, data: datos });
  } catch (error) {
    console.error('Error al obtener ingresos por medios de pago:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al consultar medios de pago.', error: error.message });
  }
}

// productos mas vendidos
async function getRotacionProductos(req, res) {
  try {
    const fechas = extraerFechas(req);
    const datos = await obtenerRotacionProductosBD(fechas);
    return res.status(200).json({ ok: true, data: datos });
  } catch (error) {
    console.error('Error al obtener rotación de productos:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al consultar rotación de productos.', error: error.message });
  }
}

// inventario bajo
async function getStockCritico(req, res) {
  try {
    const datos = await obtenerStockCriticoBD();
    return res.status(200).json({ ok: true, data: datos });
  } catch (error) {
    console.error('Error al obtener inventario crítico:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al consultar stock crítico.', error: error.message });
  }
}

// GET /api/reportes/ventas-cajeros
async function getVentasCajeros(req, res) {
  try {
    const fechas = extraerFechas(req);
    const datos = await obtenerVentasCajerosBD(fechas);
    return res.status(200).json({ ok: true, data: datos });
  } catch (error) {
    console.error('Error al obtener ventas por cajero:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al consultar trazabilidad de cajeros.', error: error.message });
  }
}

module.exports = {
  getKPIs,
  getIngresosMediosPago,
  getRotacionProductos,
  getStockCritico,
  getVentasCajeros
};
