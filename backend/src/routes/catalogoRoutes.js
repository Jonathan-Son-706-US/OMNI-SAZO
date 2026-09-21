const express = require('express');
const router = express.Router();
const { getMarcas, getCategorias, getPresentaciones } = require('../controllers/catalogoController');

router.get('/marcas', getMarcas);
router.get('/categorias', getCategorias);
router.get('/presentaciones', getPresentaciones);

module.exports = router;