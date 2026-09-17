const express = require('express');
const cors = require('cors'); //@jonas: esto para las peticiones del fronted
const authRoutes = require('./src/routes/authRoutes');

const app = express();

// @jonas: middewares globales
app.use(cors());
app.use(express.json()); 

app.use('/api/auth', authRoutes);

// @jonas: nuestra Configuración del puerto si es necesario cambiarlo para no interferir con arquiI
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});