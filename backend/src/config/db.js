const sql = require('mssql');

const dbConfig = {
  user: 'usuarioLejos',
  password: 'sazo10', 
  server: 'ABNER\\SQLEXPRESS01', 
  database: 'OMNISAZO',
  options: { encrypt: false, trustServerCertificate: true }
};

module.exports = { sql, dbConfig };