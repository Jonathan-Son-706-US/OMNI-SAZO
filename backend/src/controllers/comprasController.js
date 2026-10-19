const {
  obtenerOrdenesBD,
  obtenerOrdenesPendientesBD,
  obtenerOrdenCompraDetalleBD,
  obtenerRecepcionOrdenBD,
  crearOrdenCompraBD,
  actualizarOrdenCompraBD,
  registrarRecepcionBD
} = require('../services/comprasService');

// @Javier: listar todas las ordenes de compra
const getOrdenes = async (req, res) => {
  try {
    const ordenes = await obtenerOrdenesBD();
    res.json(ordenes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar órdenes de compra', error: error.message });
  }
};

// @Javier: listar ordenes pendientes de recepcion
const getOrdenesPendientes = async (req, res) => {
  try {
    const ordenes = await obtenerOrdenesPendientesBD();
    res.json(ordenes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar órdenes pendientes', error: error.message });
  }
};

// @Javier: detalle de una orden de compra
const getOrdenCompraDetalle = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await obtenerOrdenCompraDetalleBD(id);
    if (!data.encabezado) {
      return res.status(404).json({ mensaje: 'Orden de compra no encontrada.' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar detalle de la orden', error: error.message });
  }
};

// @Javier: cargar detalle para el formulario de recepcion
const getRecepcionOrden = async (req, res) => {
  const { id } = req.params;
  try {
    const detalle = await obtenerRecepcionOrdenBD(id);
    res.json(detalle);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cargar la recepción de la orden', error: error.message });
  }
};

// @Javier: crear una orden de compra
const crearOrden = async (req, res) => {
  const { idProveedor, detalles } = req.body;
  if (!idProveedor || !detalles || !Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ mensaje: 'Se requiere proveedor y al menos un producto.' });
  }

  try {
    const data = await crearOrdenCompraBD(idProveedor, detalles);
    if (data && data.IdOrdenCompra) {
      res.status(201).json({ ok: true, mensaje: data.Mensaje, idOrdenCompra: data.IdOrdenCompra });
    } else {
      res.status(400).json({ ok: false, mensaje: (data && data.Mensaje) || 'No se pudo crear la orden' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la orden de compra', error: error.message });
  }
};

// @Javier: actualizar una orden de compra (solo si sigue PENDIENTE)
const actualizarOrden = async (req, res) => {
  const { id } = req.params;
  const { idProveedor, detalles } = req.body;

  if (!idProveedor || !detalles || !Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ mensaje: 'Se requiere proveedor y al menos un producto.' });
  }

  try {
    const data = await actualizarOrdenCompraBD(id, idProveedor, detalles);
    if (data.Exito === 1) {
      res.json({ ok: true, mensaje: data.Mensaje });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la orden de compra', error: error.message });
  }
};

// @Javier: confirmar ingreso a bodega (recepcion total)
const registrarRecepcion = async (req, res) => {
  const { idOrdenCompra, items } = req.body;
  const idUsuario = req.usuario && req.usuario.idUsuario;

  if (!idOrdenCompra || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ mensaje: 'Se requiere la orden y al menos un ítem a recibir.' });
  }
  if (!idUsuario) {
    return res.status(400).json({ mensaje: 'No se pudo identificar al usuario.' });
  }

  try {
    const data = await registrarRecepcionBD(idOrdenCompra, idUsuario, items);
    if (data.Exito === 1) {
      res.status(201).json({ ok: true, mensaje: data.Mensaje, idRecepcion: data.IdRecepcion });
    } else {
      res.status(400).json({ ok: false, mensaje: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar el ingreso a bodega', error: error.message });
  }
};

module.exports = {
  getOrdenes,
  getOrdenesPendientes,
  getOrdenCompraDetalle,
  getRecepcionOrden,
  crearOrden,
  actualizarOrden,
  registrarRecepcion
};
