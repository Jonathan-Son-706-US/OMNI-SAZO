const express = require('express');
const router = express.Router();
const {
  getKPIs,
  getIngresosMediosPago,
  getRotacionProductos,
  getStockCritico,
  getVentasCajeros
} = require('../controllers/reportesController');
const { verificarToken, esGerente } = require('../middlewares/authMiddlewares');

// Todas las rutas de reportería gerencial están restringidas al rol de Gerente (idRol: 3)
router.get('/kpis', verificarToken, esGerente, getKPIs);
router.get('/medios-pago', verificarToken, esGerente, getIngresosMediosPago);
router.get('/rotacion-productos', verificarToken, esGerente, getRotacionProductos);
router.get('/stock-critico', verificarToken, esGerente, getStockCritico);
router.get('/ventas-cajeros', verificarToken, esGerente, getVentasCajeros);

module.exports = router;
