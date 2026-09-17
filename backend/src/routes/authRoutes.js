const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// ruta de prueba para postSUS
//@jonas: si pueden hagan sus rutas para probar 
router.post('/login', login);

module.exports = router;