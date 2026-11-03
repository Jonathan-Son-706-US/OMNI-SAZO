const express = require('express');
const router = express.Router();
const {
  getFacturaParaAnulacion,
  anularFactura
} = require('../controllers/anulacionController');
const { verificarToken, esCajeroOGerente } = require('../middlewares/authMiddlewares');

// Consulta de factura por número para vista previa de anulación
router.get('/:id', verificarToken, esCajeroOGerente, getFacturaParaAnulacion);

// Ejecución transaccional de la anulación (devolución a lotes + total a 0.00)
router.post('/', verificarToken, esCajeroOGerente, anularFactura);

module.exports = router;
