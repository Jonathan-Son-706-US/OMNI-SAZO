const sql = require('mssql');

const dbConfig = {
  user: 'sa',
  password: '1234', 
  server: 'localhost\\SQLJAVIDB2026', 
  database: 'OmniSazoBD',
  options: { encrypt: false, trustServerCertificate: true }
};

module.exports = { sql, dbConfig };