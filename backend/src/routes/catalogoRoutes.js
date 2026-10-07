const express = require('express');
const router = express.Router();
const { getRoles, getMarcas, getCategorias, getPresentaciones } = require('../controllers/catalogoController');
const { verificarToken } = require('../middlewares/authMiddlewares');

router.get('/roles', verificarToken, getRoles);
router.get('/marcas', verificarToken, getMarcas);
router.get('/categorias', verificarToken, getCategorias);
router.get('/presentaciones', verificarToken, getPresentaciones);

module.exports = router;