const express = require('express');
const cors = require('cors'); //@jonas: esto para las peticiones del fronted
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const proveedorRoutes = require('./src/routes/proveedorRoutes');
const catalogoRoutes = require('./src/routes/catalogoRoutes');

const app = express();

// @jonas: middewares globales
app.use(cors());
app.use(express.json()); 

app.use('/api/auth', authRoutes);

// @javi: endpoints para el mantenimiento de las tablas fuertes
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/catalogos', catalogoRoutes);
//  PARCHES TEMPORALES DE AMBROCIO PARA QUE EL FRONTEND NO TIRE 404 que sino no miraba nadota o como iba a quedar
// @Javi: Cuando vayas a hacer la lógica real y tus controllers, borra todo este 
// bloque y reemplazalo por tus importaciones (ej. app.use('/api/usuarios', usuariosRoutes))
// @jonas: nuestra Configuración del puerto si es necesario cambiarlo para no interferir con arquiI
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});