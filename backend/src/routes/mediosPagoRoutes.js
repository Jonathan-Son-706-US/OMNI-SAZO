const express = require('express');
const router = express.Router();
const {
  getMediosPago,
  createMedioPago,
  updateMedioPago,
  deleteMedioPago,
  registrarPagos,
  getPagosFactura,
  getFacturaImpresion,
  getFacturas,
  createFacturaCompleta
} = require('../controllers/mediosPagoController');

const { verificarToken } = require('../middlewares/authMiddlewares');

// @abner: crud de medios de pago
router.get('/', verificarToken, getMediosPago);
router.post('/', verificarToken, createMedioPago);
router.put('/:id', verificarToken, updateMedioPago);
router.delete('/:id', verificarToken, deleteMedioPago);

// @abner: registro de pagos de una factura
router.post('/pagos', verificarToken, registrarPagos);
router.get('/pagos/:id', verificarToken, getPagosFactura);

// @abner: impresion de factura, trae toda la info necesaria
router.get('/factura/:id', verificarToken, getFacturaImpresion);

// @abner: historial de facturas y crear factura completa
router.get('/facturas/listado', verificarToken, getFacturas);
router.post('/facturas/crear', verificarToken, createFacturaCompleta);

module.exports = router;
