const sql = require('mssql');

const dbConfig = {
  user: 'admin_pin',          // El usuario de SQL Server que creaste
  password: 'Admin123',     // La contraseña que le asignaste
  server: 'localhost',       // Cambia el punto '.' por 'localhost'
  database: 'OMNISAZO',
  options: { 
    encrypt: false, 
    trustServerCertificate: true 
  }
};

module.exports = { sql, dbConfig };