const cotizacionesService = require('../services/cotizacionesService');

exports.crearCotizacion = async (req, res) => {
  try {
    const { idCliente, detalles } = req.body;

    if (!idCliente) {
      return res.status(400).json({ error: 'Debe seleccionar un cliente.' });
    }
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ error: 'La cotización debe incluir al menos un producto.' });
    }

    for (const d of detalles) {
      const cant = Number(d.cantidad);
      if (isNaN(cant) || cant <= 0) {
        return res.status(400).json({ error: 'La cantidad de cada producto debe ser mayor a cero.' });
      }
      const precio = Number(d.precioUnitario);
      if (isNaN(precio) || precio <= 0) {
        return res.status(400).json({ error: 'El precio unitario de cada producto debe ser mayor a cero.' });
      }
    }

    const resultado = await cotizacionesService.crearCotizacionBD(idCliente, detalles);

    res.status(201).json({
      message: 'Cotización creada exitosamente',
      data: resultado
    });
  } catch (error) {
    console.error('Error al crear cotización:', error);
    res.status(500).json({ error: 'Error interno al procesar cotización' });
  }
};

// @abner: listar todas las cotizaciones
exports.getCotizaciones = async (req, res) => {
  try {
    const cotizaciones = await cotizacionesService.obtenerCotizacionesBD();
    res.json(cotizaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar cotizaciones' });
  }
};

// @abner: obtener detalle de una cotizacion
exports.getCotizacionDetalle = async (req, res) => {
  const { id } = req.params;
  try {
    const cotizacion = await cotizacionesService.obtenerCotizacionDetalleBD(id);
    if (!cotizacion.encabezado) {
      return res.status(404).json({ error: 'Cotización no encontrada.' });
    }
    res.json(cotizacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar detalle de cotización' });
  }
};

// @abner: confirmar cotizacion
exports.confirmarCotizacion = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await cotizacionesService.confirmarCotizacionBD(id);
    if (data.Exito === 1) {
      res.json({ ok: true, message: data.Mensaje });
    } else {
      res.status(400).json({ error: data.Mensaje });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al confirmar cotización' });
  }
};
