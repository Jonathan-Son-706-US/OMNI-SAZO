const express = require('express');
const router = express.Router();
const cotizacionesController = require('../controllers/cotizacionesController');
const { verificarToken } = require('../middlewares/authMiddlewares');

router.post('/', verificarToken, cotizacionesController.crearCotizacion);
router.get('/', verificarToken, cotizacionesController.getCotizaciones); // @abner: lista de cotizaciones
router.get('/:id', verificarToken, cotizacionesController.getCotizacionDetalle); // @abner: detalle de una cotizacion
router.put('/:id/confirmar', verificarToken, cotizacionesController.confirmarCotizacion); // @abner: confirmar cotizacion

module.exports = router;