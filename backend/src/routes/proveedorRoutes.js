const express = require('express');
const router = express.Router();
const { 
  getProveedores, 
  createProveedor, 
  updateProveedor, 
  deleteProveedor 
} = require('../controllers/proveedorController');

const { verificarToken } = require('../middlewares/authMiddlewares');

router.get('/', verificarToken, getProveedores);
router.post('/', verificarToken, createProveedor);
router.put('/:id', verificarToken, updateProveedor);
router.delete('/:id', verificarToken, deleteProveedor);

module.exports = router;