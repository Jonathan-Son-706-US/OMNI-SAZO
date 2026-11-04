const {
  crearFacturaPEPSBD,
  obtenerStockDisponibleBD
} = require('../services/facturasService');

// @Javi: procesar la facturación transaccional (PEPS)
const crearFactura = async (req, res) => {
  const { idCliente, idCotizacion, detalle, mediosPago } = req.body;
  const idUsuario = req.usuario && req.usuario.idUsuario;

  if (!idCliente) {
    return res.status(400).json({ ok: false, mensaje: 'Debe seleccionar un cliente.' });
  }
  if (!idUsuario) {
    return res.status(400).json({ ok: false, mensaje: 'No se pudo identificar al usuario emisor.' });
  }
  if (!detalle || !Array.isArray(detalle) || detalle.length === 0) {
    return res.status(400).json({ ok: false, mensaje: 'Debe agregar al menos un producto.' });
  }
  if (!mediosPago || !Array.isArray(mediosPago) || mediosPago.length === 0) {
    return res.status(400).json({ ok: false, mensaje: 'Debe agregar al menos un medio de pago.' });
  }

  for (const item of detalle) {
    const cant = Number(item.cantidad);
    if (isNaN(cant) || cant <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'La cantidad de cada producto debe ser mayor a cero.' });
    }
    const precio = Number(item.precioUnitario);
    if (isNaN(precio) || precio <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'El precio unitario de cada producto debe ser mayor a cero.' });
    }
  }

  for (const pago of mediosPago) {
    const monto = Number(pago.monto);
    if (isNaN(monto) || monto <= 0) {
      return res.status(400).json({ ok: false, mensaje: 'El monto de cada medio de pago debe ser mayor a cero.' });
    }
  }

  try {
    const data = await crearFacturaPEPSBD({ idCliente, idCotizacion, idUsuario, detalle, mediosPago });

    if (data && data.Exito === 1) {
      res.status(201).json({ ok: true, mensaje: data.Mensaje, idFactura: data.IdFactura });
    } else {
      res.status(400).json({ ok: false, mensaje: (data && data.Mensaje) || 'No se pudo procesar la factura.' });
    }
  } catch (error) {
    console.error('Error al crear factura:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno al procesar la factura.' });
  }
};

// @Javi: consultar stock disponible para el carrito de facturación
const getStockDisponible = async (req, res) => {
  try {
    const stock = await obtenerStockDisponibleBD();
    res.json(stock);
  } catch (error) {
    console.error('Error al consultar stock:', error);
    res.status(500).json({ mensaje: 'Error al consultar stock disponible', error: error.message });
  }
};

module.exports = { crearFactura, getStockDisponible };
