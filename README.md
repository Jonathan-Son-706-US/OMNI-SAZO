OMNI-SAZO - Sistema de Gestión e Inventario

Sistema integral de gestión de inventarios, catalogación, facturación y autenticación de usuarios. Desarrollado con **React** en el Frontend, **Node.js / Express** en el Backend y **SQL Server** como motor de base de datos.

Requisitos Previos

Antes de desplegar o ejecutar la aplicación, asegúrese de tener instalado:

* **Node.js** (v16.0.0 o mayor)
* **SQL Server Management Studio (SSMS)** o extensión de SQL Server para VS Code
* **Git**

---

Paso 1: Configuración de la Base de Datos SQL Server

1. Abra **SQL Server Management Studio (SSMS)** y cree una nueva base de datos llamada `OMNISAZO` (o ejecute los scripts seleccionando `USE OMNISAZO;`).
2. Diríjase a la carpeta del proyecto en `db/scripts/` y ejecute los archivos `.sql` en el siguiente orden:

   1. **`PFBD2Script.sql`**: script de nuestra DB 
   2. **`PROCEDUREPFBD2Script.sql`**: Crea los procedimientos almacenados.
   3. **`INSERTSPFBD2Script.sql`**: Inserts primordiales para los cruds y uso general del sistema

3. **Credenciales predeterminadas para pruebas:** //esto se encuentra en los inserts para el usuario
   * **Usuario:** `admin_prueba`
   * **Contraseña:** `Admin123!`
   * **Rol:** Gerente (IdRol: 3)

Paso 2: Configuración del Archivo de Conexión 

Abra el archivo `src/config/db.js` (o `backend/src/config/db.js`) y configure los datos de conexión correspondientes a su instancia local de SQL Server:
nota igual si se trabajase con un usuario remoto en `frontend/public/ComoDebentenersuUsuario.png` esta una captura de que permisos debe tener ese usuario para no tener errores vitales con respecto a acceso/edición y ejecución 

```javascript
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


2. Iniciar el Backend (APIREST + NODEMON)
Abra una terminal en la raíz de su proyecto y navegue al directorio del proyecto
'cd backend'
Instale todas las dependencias del proyecto:
'npm install'
ejecutar/levantar backend:
'npm run dev'
El servidor backend quedará escuchando en http://localhost:5000

2. Iniciar el Frontend (React)
Abra una nueva terminal y navegue a la carpeta del cliente web:
'cd frontend'
Instale las dependencias de React:
'npm install'
'npm run dev'
