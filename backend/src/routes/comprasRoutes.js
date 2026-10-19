const express = require('express');
const router = express.Router();
const {
  getOrdenes,
  getOrdenesPendientes,
  getOrdenCompraDetalle,
  getRecepcionOrden,
  crearOrden,
  actualizarOrden,
  registrarRecepcion
} = require('../controllers/comprasController');
const { verificarToken } = require('../middlewares/authMiddlewares');

// @Javier: modulo de compras e ingreso a bodega
router.get('/ordenes', verificarToken, getOrdenes);
router.get('/ordenes/pendientes', verificarToken, getOrdenesPendientes); // antes de /ordenes/:id
router.post('/ordenes', verificarToken, crearOrden);
router.get('/ordenes/:id', verificarToken, getOrdenCompraDetalle);
router.put('/ordenes/:id', verificarToken, actualizarOrden);
router.get('/ordenes/:id/recepcion', verificarToken, getRecepcionOrden);

router.post('/recepciones', verificarToken, registrarRecepcion);

module.exports = router;
