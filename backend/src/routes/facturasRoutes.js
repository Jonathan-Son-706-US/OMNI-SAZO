const express = require('express');
const router = express.Router();
const { crearFactura, getStockDisponible } = require('../controllers/facturasController');
const { verificarToken, esCajeroODigitador } = require('../middlewares/authMiddlewares');

// @Javi: módulo de facturación transaccional PEPS
// Solo Cajero (2) y Digitador (1) pueden emitir facturas
router.get('/stock-disponible', verificarToken, getStockDisponible);
router.post('/', verificarToken, esCajeroODigitador, crearFactura);

module.exports = router;
