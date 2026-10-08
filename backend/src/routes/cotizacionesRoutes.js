const express = require('express');
const router = express.Router();
const cotizacionesController = require('../controllers/cotizacionesController');
const { verificarToken } = require('../middlewares/authMiddlewares');

router.post('/', verificarToken, cotizacionesController.crearCotizacion);

module.exports = router;