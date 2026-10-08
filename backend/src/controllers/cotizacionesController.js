const cotizacionesService = require('../services/cotizacionesService');

exports.crearCotizacion = async (req, res) => {
  try {
    const { idCliente, detalle } = req.body;
    const resultado = await cotizacionesService.crearCotizacionBD(idCliente, detalle);

    res.status(201).json({
      message: 'Cotización creada exitosamente',
      data: resultado
    });
  } catch (error) {
    console.error('Error al crear cotización:', error);
    res.status(500).json({ error: 'Error interno al procesar cotización' });
  }
};