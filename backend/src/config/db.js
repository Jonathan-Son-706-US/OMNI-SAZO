const sql = require('mssql');

const dbConfig = {
  user: 'usuarioLejos',
  password: '123', 
  server: 'localhost', 
  database: 'OMNISAZO',

  options: { encrypt: false, trustServerCertificate: true }
};

module.exports = { sql, dbConfig };