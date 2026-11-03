const {
  obtenerFacturaParaAnulacionBD,
  anularFacturaBD
} = require('../services/anulacionService');

// buscar factura por id para anular
async function getFacturaParaAnulacion(req, res) {
  try {
    const idFactura = parseInt(req.params.id, 10);
    if (!idFactura || isNaN(idFactura)) {
      return res.status(400).json({ ok: false, mensaje: 'El número de factura debe ser un entero válido.' });
    }

    const factura = await obtenerFacturaParaAnulacionBD(idFactura);
    if (!factura) {
      return res.status(404).json({ ok: false, mensaje: `No se encontró ninguna factura con el número ${idFactura}.` });
    }

    return res.status(200).json({ ok: true, data: factura });
  } catch (error) {
    console.error('Error al consultar factura para anulación:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno en el servidor.', error: error.message });
  }
}

// ejecutar anulacion de factura
async function anularFactura(req, res) {
  try {
    const { idFactura, motivo } = req.body;
    const idUsuario = req.usuario ? req.usuario.idUsuario : null;

    if (!idFactura || isNaN(parseInt(idFactura, 10))) {
      return res.status(400).json({ ok: false, mensaje: 'Debe especificar el número de factura a anular.' });
    }

    if (!motivo || typeof motivo !== 'string' || !motivo.trim()) {
      return res.status(400).json({ ok: false, mensaje: 'Debe indicar una justificación o motivo válido para la anulación.' });
    }

    if (!idUsuario) {
      return res.status(401).json({ ok: false, mensaje: 'No se pudo identificar el usuario autenticado.' });
    }

    const resultado = await anularFacturaBD({
      idFactura: parseInt(idFactura, 10),
      idUsuario: parseInt(idUsuario, 10),
      motivo: motivo.trim()
    });

    if (!resultado || resultado.Exito !== 1) {
      return res.status(400).json({
        ok: false,
        mensaje: resultado ? resultado.Mensaje : 'No se pudo completar la anulación transaccional.'
      });
    }

    return res.status(200).json({
      ok: true,
      mensaje: resultado.Mensaje,
      idFactura: resultado.IdFactura
    });
  } catch (error) {
    console.error('Error al anular factura:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno en la transacción.', error: error.message });
  }
}

module.exports = {
  getFacturaParaAnulacion,
  anularFactura
};
