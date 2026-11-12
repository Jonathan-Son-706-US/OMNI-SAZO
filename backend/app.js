const express = require('express');
const cors = require('cors'); //@jonas: esto para las peticiones del fronted
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const proveedorRoutes = require('./src/routes/proveedorRoutes');
const catalogoRoutes = require('./src/routes/catalogoRoutes');
const cotizacionesRoutes = require('./src/routes/cotizacionesRoutes');
const comprasRoutes = require('./src/routes/comprasRoutes');
const facturasRoutes = require('./src/routes/facturasRoutes');
const mediosPagoRoutes = require('./src/routes/mediosPagoRoutes');
const anulacionRoutes = require('./src/routes/anulacionRoutes');
const reportesRoutes = require('./src/routes/reportesRoutes');

const app = express();

// @jonas: middewares globales
app.use(cors());
app.use(express.json()); 
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));


// @javi: endpoints para el mantenimiento de las tablas fuertes
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/catalogos', catalogoRoutes);
app.use('/api/cotizaciones', cotizacionesRoutes);
app.use('/api/compras', comprasRoutes); // @Javier: modulo de compras e ingreso a bodega
app.use('/api/facturas', facturasRoutes); // @Javi: modulo de facturacion transaccional PEPS
app.use('/api/medios-pago', mediosPagoRoutes); // @abner: nueva ruta para medios de pago e impresion
app.use('/api/anulaciones', anulacionRoutes); // modulo de anulacion transaccional
app.use('/api/reportes', reportesRoutes); // modulo de reportes gerenciales

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
