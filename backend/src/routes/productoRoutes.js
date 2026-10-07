const express = require('express');
const router = express.Router();
const { 
  getProductos, 
  createProducto, 
  updateProducto, 
  deleteProducto 
} = require('../controllers/productoController');
const { verificarToken } = require('../middlewares/authMiddlewares');

router.get('/', verificarToken, getProductos);
router.post('/', verificarToken, createProducto);
router.put('/:id', verificarToken, updateProducto);
router.delete('/:id', verificarToken, deleteProducto);

module.exports = router;