const express = require('express');
const router = express.Router();
const { 
  getClientes, 
  createCliente, 
  updateCliente, 
  deleteCliente 
} = require('../controllers/clienteController');

const { verificarToken } = require('../middlewares/authMiddlewares');

router.get('/', verificarToken, getClientes);
router.post('/', verificarToken, createCliente);
router.put('/:id', verificarToken, updateCliente);
router.delete('/:id', verificarToken, deleteCliente);

module.exports = router;