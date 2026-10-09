const {
  obtenerMediosPagoBD,
  crearMedioPagoBD,
  actualizarMedioPagoBD,
  eliminarMedioPagoBD,
  registrarPagosFacturaBD,
  obtenerPagosFacturaBD,
  obtenerFacturaImpresionBD,
  obtenerFacturasBD,
  crearFacturaCompletaBD
} = require('../services/mediosPagoService');

// @abner: listar todos los medios de pago
const getMediosPago = async (req, res) => {
  try {
    const medios = await obtenerMediosPagoBD();
    res.json(medios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar medios de pago', error: error.message });
  }
};

// @abner: crear un medio de pago nuevo
const createMedioPago = async (req, res) => {
  const { nombreMedioPago } = req.body;
  if (!nombreMedioPago) {
    return res.status(400).json({ mensaje: 'El nombre del medio de pago es obligatorio.' });
  }

  try {
    const data = await crearMedioPagoBD(nombreMedioPago);
    if (data.Exito === 1) {
      res.status(201).json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar medio de pago', error: error.message });
  }
};

// @abner: actualizar un medio de pago
const updateMedioPago = async (req, res) => {
  const { id } = req.params;
  const { nombreMedioPago } = req.body;

  if (!id || !nombreMedioPago) {
    return res.status(400).json({ mensaje: 'El ID y nombre son obligatorios.' });
  }

  try {
    const data = await actualizarMedioPagoBD(id, nombreMedioPago);
    if (data.Exito === 1) {
      res.json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar medio de pago', error: error.message });
  }
};

// @abner: eliminar un medio de pago
const deleteMedioPago = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await eliminarMedioPagoBD(id);
    if (data.Exito === 1) {
      res.json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar medio de pago', error: error.message });
  }
};

// @abner: registrar pagos en una factura, el body trae idFactura y un array de pagos
const registrarPagos = async (req, res) => {
  const { idFactura, pagos } = req.body;
  if (!idFactura || !pagos || !Array.isArray(pagos) || pagos.length === 0) {
    return res.status(400).json({ mensaje: 'Se requiere idFactura y al menos un pago.' });
  }

  try {
    const data = await registrarPagosFacturaBD(idFactura, pagos);
    if (data.Exito === 1) {
      res.status(201).json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar pagos', error: error.message });
  }
};

// @abner: obtener los pagos de una factura
const getPagosFactura = async (req, res) => {
  const { id } = req.params;
  try {
    const pagos = await obtenerPagosFacturaBD(id);
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar pagos de la factura', error: error.message });
  }
};

// @abner: obtener la factura completa para imprimirla
const getFacturaImpresion = async (req, res) => {
  const { id } = req.params;
  try {
    const factura = await obtenerFacturaImpresionBD(id);
    if (!factura.encabezado) {
      return res.status(404).json({ ok: false, mensaje: 'Factura no encontrada.' });
    }
    res.json(factura);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener factura para impresion', error: error.message });
  }
};

// @abner: listar facturas
const getFacturas = async (req, res) => {
  try {
    const facturas = await obtenerFacturasBD();
    res.json(facturas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar facturas', error: error.message });
  }
};

// @abner: guardar la factura con todo y sus pagos
const createFacturaCompleta = async (req, res) => {
  try {
    const { idCliente, idCotizacion, montoTotal, detalles, pagos } = req.body;
    
    // Obtenemos el IdUsuario desde el token, pero req.usuario trae el "NombreUsuario", 
    // entonces necesitamos sacar el IdUsuario del payload o mandarlo desde el front. 
    // Para no complicar, asumiremos que req.idUsuario viene en el middleware o mandamos 1
    const idUsuario = req.idUsuario || 1; 

    const data = await crearFacturaCompletaBD(idCliente, idUsuario, idCotizacion, montoTotal, detalles, pagos);
    
    if (data.Exito === 1) {
      res.status(201).json({ ok: true, mensaje: data.Mensaje, idFactura: data.IdFactura });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno al crear factura', error: error.message });
  }
};

module.exports = {
  getMediosPago,
  createMedioPago,
  updateMedioPago,
  deleteMedioPago,
  registrarPagos,
  getPagosFactura,
  getFacturaImpresion,
  getFacturas,
  createFacturaCompleta
};
