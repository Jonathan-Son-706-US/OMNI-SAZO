const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER || 'usuariolejos',
  password: process.env.DB_PASSWORD || '123',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'OMNISAZO',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

module.exports = { sql, dbConfig };