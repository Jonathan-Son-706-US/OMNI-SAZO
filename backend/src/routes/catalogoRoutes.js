const express = require('express');
const router = express.Router();
const { getRoles, getMarcas, getCategorias, getPresentaciones, getBodegas, getUbicaciones } = require('../controllers/catalogoController');
const { verificarToken } = require('../middlewares/authMiddlewares');

router.get('/roles', verificarToken, getRoles);
router.get('/marcas', verificarToken, getMarcas);
router.get('/categorias', verificarToken, getCategorias);
router.get('/presentaciones', verificarToken, getPresentaciones);
router.get('/bodegas', verificarToken, getBodegas);
router.get('/ubicaciones', verificarToken, getUbicaciones);

module.exports = router;