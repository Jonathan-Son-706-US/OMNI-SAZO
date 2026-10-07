const express = require('express');
const router = express.Router();
const { 
  getUsuarios, 
  createUsuario, 
  updateUsuario, 
  deleteUsuario 
} = require('../controllers/userController');

const { verificarToken } = require('../middlewares/authMiddlewares');

router.get('/', verificarToken, getUsuarios);
router.post('/', verificarToken, createUsuario);
router.put('/:id', verificarToken, updateUsuario);
router.delete('/:id', verificarToken, deleteUsuario);

module.exports = router;