# OMNI-SAZO - Sistema de Gestión e Inventario (Fase 2)

## Paso 1: Configuración de la Base de Datos SQL Server

1. **Inicialización limpia (Cambios aplicados a considerar)**
Diríjase a la carpeta del proyecto en `db/scripts/` y ejecute los archivos `.sql` en el siguiente orden:
    1. **`PFBD2Script.sql`**: Script de tablas y estructura de nuestra DB.
    2. **`sp_OMNISAZO.sql`**: Procedimientos almacenados base de la Fase 1 corregidos (módulo de cotizaciones e impresiones de la fase 2 ya están integrados aca de igual manera lo de login).
    3. **`INSERTSPFBD2Script.sql`**: Inserts primordiales para los CRUDS y datos iniciales del sistema (En este caso se agregaron 2 usuarios para las pruebas de esta fase 2 cajero y digitador a su vez que un inserts para métodos de pagos).
    4. **`sp_OMNISAZO_Facturacion.sql`**: Lógica transaccional de facturación y método PEPS.
    5. **`sp_Compras.sql`**: Lógica para compras, órdenes de compra y recepciones a bodega.
2. **Opción B: Actualización sobre la DB de la Fase 1 (inserts necesarios para esta fase2 )**
Para evitar buscar los inserts nuevos dentro de **`INSERTSPFBD2Script.sql.`**Le dejamos los que se nos fue agregar y lo nuevo 
    - **Inserts Nuevos (Usuarios de prueba y Medios de Pago):**
        
        ```
        EXEC dbo.sp_RegistrarUsuario @IdRol = 2, @NombreUsuario = 'cajero_prueba', @PasswordOriginal = 'Cajero123!';
        EXEC dbo.sp_RegistrarUsuario @IdRol = 1, @NombreUsuario = 'digitador_prueba', @PasswordOriginal = 'Digitador123!';
        
        IF NOT EXISTS (SELECT 1 FROM dbo.MEDIOS_PAGO)
        BEGIN
            INSERT INTO dbo.MEDIOS_PAGO (NombreMedioPago)
            VALUES ('Efectivo'), ('Tarjeta'), ('Cheque');
        END
        GO
        ```
        
    - Archivos necesarios para ejecutar en esta Fase2
        1. **`sp_OMNISAZO.sql`**: Actualiza procedimientos corregidos de Fase 1, integrando cotizaciones e impresiones de la fase2 (Por eso no aparecen independientes para los siguientes procedures).
        2. **`sp_OMNISAZO_Facturacion.sql`**: Aplica la lógica T-SQL para facturación con PEPS y  necesarios para el modulo de Facturación Ventas.
        3. **`sp_Compras.sql`**: Implementa procedimientos para órdenes de compra e ingresos a bodega pd: Para modulo bodega .
3. **Credenciales necesarias para pruebas con su respectiva contraseña:**
    - **Gerente (IdRol: 3):** `admin_prueba` / `Admin123!`
    - **Cajero (IdRol: 2):** `cajero_prueba` / `Cajero123!`
    - **Digitador (IdRol: 1):** `digitador_prueba` / `Digitador123!`

## Paso 2: Configuración del Archivo de Conexión

Abra el archivo `src/config/db.js` (o `backend/src/config/db.js`) y configure los datos de conexión correspondientes a su instancia local de SQL Server:
*(Nota para @inge : En`frontend/public/ComoDebentenersuUsuario.png` está una captura de los permisos requeridos ).*

```
const sql = require('mssql');

const dbConfig = {
  user: 'TU_USUARIO_SQL',        // Ej: 'usuarioLejos' o 'sa'
  password: 'TU_CONTRASEÑA',     // Ej: '123'
  server: 'localhost',           // O la IP / Instancia de su SQL Server
  database: 'OMNISAZO',          // Nombre de la base de datos
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

module.exports = { sql, dbConfig };
```

## Paso 3: Iniciar el Backend (API REST + NODEMON)

Abra una terminal en la raíz de su proyecto y navegue al directorio del servidor:

```
cd backend
```

Instale todas las dependencias del proyecto:

```
npm install
```

Ejecutar/levantar backend:

```
npm run dev
```

El servidor backend quedará escuchando en `http://localhost:5000`.

## Paso 4: Iniciar el Frontend (React)

Abra una nueva terminal y navegue a la carpeta del cliente web:

```
cd frontend
```

Instale las dependencias de React:

```
npm install
```

Ejecutar/levantar frontend:

```
npm run dev
```
