const express = require('express');
const cors = require('cors'); //@jonas: esto para las peticiones del fronted
const authRoutes = require('./src/routes/authRoutes');

const app = express();

// @jonas: middewares globales
app.use(cors());
app.use(express.json()); 

app.use('/api/auth', authRoutes);


//  PARCHES TEMPORALES DE AMBROCIO PARA QUE EL FRONTEND NO TIRE 404 que sino no miraba nadota o como iba a quedar
// @Javi: Cuando vayas a hacer la lógica real y tus controllers, borra todo este 
// bloque y reemplazalo por tus importaciones (ej. app.use('/api/usuarios', usuariosRoutes))

// Parches para el modulo de usuarios y poder ver si me quedaron bien los roles y usuarios en el front
app.get('/api/roles', (req, res) => {
    res.json([
        { IdRol: 1, NombreRol: 'Digitador' },
        { IdRol: 2, NombreRol: 'Cajero' },
        { IdRol: 3, NombreRol: 'Gerente' }
    ]);
});

app.get('/api/usuarios', (req, res) => {
    res.json([
        { IdUsuario: 1, NombreUsuario: 'ambrocio', IdRol: 3, Estado: true }
    ]);
});

app.post('/api/usuarios', (req, res) => {
    res.json({ mensaje: "Simulación: Usuario guardado en el form de Ambrocio" });
});

// Parches para el modulo de Inventario / Caja
app.get('/api/productos', (req, res) => {
    res.json([
        { IdProducto: 1, NombreProducto: 'Pintura Blanca Cubeta', PrecioVentaBase: 250.00 }
    ]);
});

app.get('/api/clientes', (req, res) => {
    res.json([
        { IdCliente: 1, Nombre: 'Consumidor Final (CF)' }
    ]);
});


// @jonas: nuestra Configuración del puerto si es necesario cambiarlo para no interferir con arquiI
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});